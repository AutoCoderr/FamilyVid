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
		return (this.datas.action == this.form.config.actionName);
	}
	async isValid() {
		delete this.datas.action;
		if (Object.keys(this.datas).length !== Object.keys(this.form.fields).length) {
			return ["Tentative de hack!!"];
		}
		const errors = await this.checkFields();
		if (errors.length == 0) return true;

		if(typeof(this.req.session.errors) == "undefined") {
			this.req.session.errors = {};
		}
		if (typeof(this.req.session.fields) == "undefined") {
			this.req.session.datas = {};
		}

		this.req.session.errors[this.form.config.actionName] = errors;
		this.req.session.datas[this.form.config.actionName] = {...this.datas};

		return false;
	}

	async checkFields() {
		let errors: Array<string> = [];

		for (let name in this.form.fields) {
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

			} else if (typeof(field.uniq) != "undefined") {
				// @ts-ignore
				let repository = require("../Repositories/"+field.uniq.table+"Repository").default;

				let where = {};
				where[field.uniq.column] = this.datas[name];
				const elem = await repository.findOneByParams({where});
				if (elem != null) {
					errors.push(field.uniq.msgError);
				}
			}
		}
		return errors;
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
		let regex = RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$");
		let res = regex.test(email);
		return res;
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

}
