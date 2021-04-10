import Helpers from "./Helpers";


export default class Validator {
	datas;
	form;
	req;

	constructor(req,form) {
		this.datas = Helpers.getDatas(req);
		this.form = form;
		this.req = req;
	}

	isSubmitted() {
		return (this.datas.actionName == this.form.config.actionName);
	}
	async isValid() {
		delete this.datas.actionName;
		this.fillCheckboxs();
		const errors = await this.checkFields();
		if (errors.length == 0) return true;

		this.setFlashErrors(errors);
		return false;
	}

	async checkFields() {
		let errors: Array<string> = [];

		if (this.req.session.token != undefined && this.datas.token != this.req.session.token) {
			return ["Token invalide!"];
		}
		delete this.datas.token;
		for (const name in this.form.fields) {
			if (!Object.keys(this.datas).includes(name)) {
				this.datas[name] = undefined;
			}
		}

		if (Object.keys(this.datas).length !== Object.keys(this.form.fields).length) {
			return ["Tentative de hack!!"];
		}

		for (const name in this.form.fields) {
			const field = this.form.fields[name];

			if (typeof(this.datas[name]) == "undefined") {
				errors.push("Champs '"+name+"' manquant!");
				continue;
			}

			if (field.required && this.datas[name] === "") {
				errors.push(("Champs '"+name+"' vide!"));
				continue;
			}

			if (this.datas[name].length < field.minLength && this.datas[name].length > field.maxLength) {
				errors.push(field.msgError);
				continue;
			}

			if (
				(this.datas[name].length < field.minLength || this.datas[name].length > field.maxLength) ||

				((field.checkValid || field.checkValid == undefined) && typeof(this["check"+Helpers.ucFirst(field.type)]) == "function" &&
					!this["check"+Helpers.ucFirst(field.type)](field,this.datas[name]))
			) {
				errors.push(field.msgError);
				continue;

			} else if (typeof(field.uniq) != "undefined") {
				if (this.datas[name] != "") {
					let repository = require("../Repositories/" + field.uniq.table + "Repository").default;

					let where = field.uniq.where ? field.uniq.where : {};
					where[field.uniq.column] = this.datas[name];
					const elem = await repository.findOneByParams({where: where});
					if (elem != null) {
						errors.push(field.uniq.msgError);
					}
				} else {
					errors.push(field.uniq.msgError);
				}
				continue;
			}

			if (typeof(field.entity) != "undefined") {
				let id = this.datas[name]
				if (!this.isNumber(id)) {
					errors.push(field.msgError);
				} else {
					const repository = require("../Repositories/"+field.entity+"Repository").default;
					const elem = await repository.findOne(id);
					if (elem == null) {
						errors.push(field.msgError);
					}
				}
			}
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
		return !(field.mimes instanceof Array) || field.mimes.includes(file.mimetype)
	}

	thereIsASpecialChar(str) {
		const specialChars = "?.*$_-#&<>";
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

	isNumber(num) {
		return typeof(num) == "number" ||
			(
				typeof(num) == "string" && (
					parseInt(num).toString() == num && num != "NaN"
				)
		)
	}

	setFlashErrors(errors: Array<string>) {
		if(typeof(this.req.session.flash) == "undefined") {
			this.req.session.flash = {};
		}

		if(typeof(this.req.session.flash.errors) == "undefined") {
			this.req.session.flash.errors = {};
		}
		if (typeof(this.req.session.fields) == "undefined") {
			this.req.session.flash.datas = {};
		}

		this.req.session.flash.errors[this.form.config.actionName] = errors;
		this.req.session.flash.datas[this.form.config.actionName] = {...this.datas};
	}

}
