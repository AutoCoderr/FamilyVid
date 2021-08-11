import Helpers from "./Helpers";
import EntityManager from "./EntityManager";


export default class Validator {
	datas;
	form;
	req;
	errors;
	entity: null|EntityManager = null;

	constructor(req,form) {
		this.datas = Helpers.getDatas(req);
		this.form = form;
		this.req = req;
	}

	getDatas() {
		return this.datas;
	}

	getErrors() {
		return this.errors;
	}

	isSubmitted() {
		return (this.datas.actionName == this.form.config.actionName);
	}

	async save() {
		if (this.form.config.entity == undefined) {
			throw new Error("No entity specified for this form");
		}
		if (this.form.config.id && this.entity == null) {
			const entity = await Helpers.getEntityFromForm(this.form);
			if (entity == false) {
				throw new Error(this.form.config.entityNotFoundError ?? "Specified entity does not exist")
			}
		}
		if (this.entity == null) {
			this.entity = <EntityManager> (new this.form.config.entity());
		}
		for (const key in this.datas) {
			if (typeof(this.entity["set"+Helpers.ucFirst(key)]) == "function")
				await this.entity["set"+Helpers.ucFirst(key)](this.datas[key])
		}
		await this.entity.save()

		return this.entity;
	}

	async isValid(saveErrorsInFlash = true) {
		delete this.datas.actionName;

		if (!(this.entity instanceof EntityManager)) {
			const entity = await Helpers.getEntityFromForm(this.form);
			if (entity !== null) {
				if (!entity) {
					this.errors = [this.form.config.entityNotFoundError ?? "Specified entity does not exist"];
					if (saveErrorsInFlash)
						this.setFlashErrors(this.errors);
					return false;
				}
				this.entity = entity;
			}
		}

		this.fillCheckboxs();
		const errors = await this.checkFields();
		if (errors.length == 0) return true;
		if (saveErrorsInFlash)
			this.setFlashErrors(errors);
		this.errors = errors
		return false;
	}

	async checkFields() {
		if (this.req.session.token != undefined && this.datas.token != this.req.session.token) {
			return ["Token invalide!"];
		}
		delete this.datas.token;
		if (typeof(this.form.fields) != "object" ||
			this.form.fields == null ||
			this.form.fields instanceof Array) this.form.fields = {};

		if (Object.keys(this.datas).length !== Object.keys(this.form.fields).filter(key => this.form.fields[key].type != "param").length) {
			return ["Tentative de hack!!"];
		}

		let alreadyCheckeds: any = {};
		const errors: Array<string> = [];

		for (const name in this.form.fields) {
			const field = this.form.fields[name];
			if (typeof(field.depend_on) == "string")
				field.depend_on = [field.depend_on];

			let unsatisfiedField;
			if (field.depend_on instanceof Array && (unsatisfiedField = field.depend_on.find(depend_on => !alreadyCheckeds[depend_on]))) {
				if (alreadyCheckeds[unsatisfiedField] == undefined)
					errors.push("'"+name+"' field depends on '"+unsatisfiedField+"' field, but it's not accessible");
				continue;
			}

			if (field.type == "param") {
				this.datas[name] = field.value;
			}

			if (typeof(field.set) == "function") {
				this.datas[name] = await field.set(this.datas[name],this.datas);
			}

			if (typeof(this.datas[name]) == "undefined") {
				alreadyCheckeds[name] = false;
				errors.push("Champs '"+name+"' manquant!");
				continue;
			}

			let data = typeof(this.datas[name]) == "string" ? this.datas[name].trim() : this.datas[name];

			if (field.required && data === "") {
				alreadyCheckeds[name] = false;
				errors.push(("Champs '"+name+"' vide!"));
				continue;
			}

			if ((!field.required || typeof(field.required) == "undefined") && data === "") {
				continue;
			}

			if (
				(data.length < field.minLength || data.length > field.maxLength) ||

				((field.checkValid || field.checkValid == undefined) && typeof(this["check"+Helpers.ucFirst(field.type)]) == "function" &&
					!this["check"+Helpers.ucFirst(field.type)](field,data))
			) {
				alreadyCheckeds[name] = false;
				errors.push(field.msgError);
				continue;

			} else if (typeof(field.uniq) != "undefined") {
				if (data != "") {
					let repository = require("../Repositories/" + field.uniq.table + "Repository").default;

					const where = {...(field.uniq.where || {}), [field.uniq.column]: data}
					const elem = await repository.findOneByParams({where: where});
					if (elem != null) {
						alreadyCheckeds[name] = false;
						errors.push(field.uniq.msgError);
					}
				} else {
					alreadyCheckeds[name] = false;
					errors.push(field.uniq.msgError);
				}
				continue;
			}

			if (typeof(field.entity) != "undefined" && !(data instanceof EntityManager)) {
				if (!Helpers.isNumber(data)) {
					errors.push(field.msgError);
				} else {
					const repository = require("../Repositories/"+field.entity.name+"Repository").default;
					const elem = await repository.findOne(data);
					if (elem == null) {
						alreadyCheckeds[name] = false;
						errors.push(field.msgError);
						continue;
					} else {
						data = elem;
					}
				}
			}
			let resValid: boolean|string;
			if ((field.checkValid || field.checkValid == undefined) && typeof(field.valid) == "function" && (resValid = await field.valid(data,this.datas)) !== true ) {
				alreadyCheckeds[name] = false;
				errors.push(typeof(resValid) == "string" ? resValid : field.msgError);
				continue;
			}

			alreadyCheckeds[name] = true;
			this.datas[name] = data;
		}
		return errors;
	}

	fillCheckboxs() {
		for (const name in this.form.fields) {
			const field = this.form.fields[name];
			if (field.type == "checkbox") {
				this.datas[name] = this.datas[name] != undefined;
			}
		}
	}

	checkDate(field,value) {
		const regexDate = new RegExp("^[0-9]{4}-(0[1-9])|(1[0-2])-((0[1-9])|([1-2][0-9])|(3[0-1]))$");
		return regexDate.test(value);
	}

	checkSelect(field,value) {
		return Object.keys(field.options).includes(value);
	}

	checkPassword(field,password) {
		return !((typeof(field.confirmWith) != "undefined" &&
			password !== this.datas[field.confirmWith]) ||

			(typeof(field.confirmWith) == "undefined" &&
				(!this.thereIsAMinChar(password) ||
				!this.thereIsAMajChar(password) ||
				!this.thereIsANumber(password) ||
				!this.thereIsASpecialChar(password) ||
				password.length < 10)
			)
		);

	}

	checkEmail(field,email) {
		const regex = RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$");
		return regex.test(email);
	}

	checkFile(field,file) {
		if (typeof(file) != "object" || file instanceof Array || file == null || file.name == undefined) return false;

		const splitFilename = file.name.split(".");
		const filename = splitFilename.slice(0,splitFilename.length-1).join(".");
		if ((typeof(field.minLength) == "number" && filename.length < field.minLength) ||
			(typeof(field.maxLength) == "number" && filename.length > field.maxLength)) return false;

		return (!(field.mimes instanceof Array) || field.mimes.includes(file.mimetype)) && file.size <= field.max_size;
	}

	thereIsASpecialChar(str) {
		const specialChars = "!~\"'()`?/.^*@$%_-#&<>§:;,";
		for (let i=0;i<specialChars.length;i++) {
			if (str !== str.replace(specialChars[i],"")) {
				return true;
			}
		}
		return false;
	}

	thereIsANumber(str) {
		const numbers = "0123456789";
		for (let i=0;i<numbers.length;i++) {
			if (str !== str.replace(numbers[i],"")) {
				return true;
			}
		}
		return false;
	}

	thereIsAMajChar(str) {
		const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		for (let i=0;i<alphabet.length;i++) {
			if (str !== str.replace(alphabet[i],"")) {
				return true;
			}
		}
		return false;
	}

	thereIsAMinChar(str) {
		const alphabet = "abcdefghijklmnopqrstuvwxyz";
		for (let i=0;i<alphabet.length;i++) {
			if (str !== str.replace(alphabet[i],"")) {
				return true;
			}
		}
		return false;
	}

	setFlashErrors(errors: string|Array<string>) {
		if (!(errors instanceof Array)) {
			errors = [errors];
		}
		if(typeof(this.req.session.flash) == "undefined") {
			this.req.session.flash = {};
		}

		if(typeof(this.req.session.flash.errors) == "undefined") {
			this.req.session.flash.errors = {};
		}
		if (typeof(this.req.session.fields) == "undefined") {
			this.req.session.flash.datas = {};
		}

		const allowedTypes = ["string", "number"];
		for (const key in this.datas) {
			const data = this.datas[key];
			if (!allowedTypes.includes(typeof(data))) {
				delete this.datas[key];
			}
		}

		this.req.session.flash.errors[this.form.config.actionName] = errors;
		this.req.session.flash.datas[this.form.config.actionName] = {...this.datas};
	}

}
