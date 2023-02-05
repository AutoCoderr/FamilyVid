import env from './env';
import * as nodemailer from 'nodemailer';

export class Mailer {
    host: string;
    port: number;
    secure: boolean;

    user: string;
    password: string;

    destinations: Array<string>;
    subject: string;
    message: string;
    fromName: string;
    fromEmail: string;

    constructor() {
        this.host = env.SMTP_HOST;
        this.port = env.SMTP_PORT;
        this.secure = env.SMTP_SECURE;

        this.user = env.SMTP_USER;
        this.password = env.SMTP_PASSWORD;

        this.destinations = [];
        this.subject = "";
        this.message = "";
        this.fromName = env.MAIL_NAME;
        this.fromEmail = env.SMTP_USER;
    }

    async send() {
        let transporter = nodemailer.createTransport({
            host: this.host,
            port: this.port,
            secure: this.secure, // true for 465, false for other ports
            auth: {
                user: this.user, // generated ethereal user
                pass: this.password, // generated ethereal password
            },
        });

        const sended = await transporter.sendMail({
            from: '"'+this.fromName+'" <'+this.fromEmail+'>', // sender address
            to: this.destinations.join(", "), // list of receivers
            subject: this.subject, // Subject line
            text: this.message, // plain text body
            html: this.message, // html body
        });
        return sended.response.split(" ").slice(0,3).join(" ") == "250 2.0.0 OK";
    }


    addDestinations(destination: string) {
        this.destinations.push(destination);
    }

    setSubject(subject: string) {
        this.subject = subject;
    }

    setMessage(message: string) {
        this.message = message;
    }

    setFromName(fromName: string) {
        this.fromName = fromName;
    }

    setFromEmail(fromEmail: string) {
        this.fromEmail = fromEmail;
    }
}