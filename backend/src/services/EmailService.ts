import nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";
import { CustomError } from "../types/CustomError";
import { StatusCodes } from "http-status-codes";
import path from "path";
import fs from "fs";
import Handlebars from "handlebars";
import { OrdenCompra } from "../models/OrdenCompra";
import { GenerarQRDeEntrada } from "../utils/QR";
import { FormatearFecha } from "../utils/StringUtils";
import { EventoService } from "./EventoService";

export class EmailService {
  private static instance: EmailService;
  private eventoService: EventoService;
  private transporter: nodemailer.Transporter;
  private directorioEmailTemplates = "../emails/";

  private constructor() {
    this.eventoService = EventoService.getInstance();
    try {
      this.transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASS,
        },
      });
    } catch (error) {
      throw new CustomError(
        "Error al configurar el servicio de correo",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    this.registerPartials();
  }

  private registerPartials() {
    const partialsDir = path.resolve(__dirname, this.directorioEmailTemplates + "partials");
    if (!fs.existsSync(partialsDir)) return;
    const filenames = fs.readdirSync(partialsDir);
    filenames.forEach((filename) => {
      const filePath = path.join(partialsDir, filename);
      const template = fs.readFileSync(filePath, "utf-8");
      const partialName = path.parse(filename).name;
      Handlebars.registerPartial(partialName, template);
    });
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async SendEmail(
    to: string,
    subject: string,
    html: string,
    attachments: NonNullable<SendMailOptions["attachments"]> = []
  ): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL,
        to,
        subject,
        html,
        attachments,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new CustomError(
        "Error al enviar el correo electrónico",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async SendEmailInBulk(
    recipients: string[],
    subject: string,
    html: string,
    attachments: NonNullable<SendMailOptions["attachments"]> = []
  ): Promise<void> {
    if (!recipients || recipients.length === 0) return;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL,
        bcc: recipients,
        subject,
        html,
        attachments,
      });
    } catch (error) {
      throw new CustomError(
        "Error al enviar correos masivos",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async SendTicketsEmail(orden: OrdenCompra) {
    const filePath = path.resolve(
      __dirname,
      this.directorioEmailTemplates + "EntradasCompradas.hbs"
    );
    const source = fs.readFileSync(filePath, "utf-8");
    const template = Handlebars.compile(source);

    let entradas: any[] = [];
    let attachments: NonNullable<SendMailOptions["attachments"]> = [];

    try {
      for (const detalle of orden.detalles) {
        for (const dni of detalle.dnis) {
          const qrBase64 = await GenerarQRDeEntrada(orden.id, detalle.id, dni);
          const qrContent = qrBase64.replace(/^data:image\/png;base64,/, "");
          const cid = `qr_${orden.id}_${detalle.id}_${dni}@app`;

          entradas.push({
            zona: detalle.zona.nombre,
            precio: detalle.precioUnitario,
            dni,
            qrCid: cid,
          });

          attachments.push({
            filename: `qr_${dni}.png`,
            content: qrContent,
            encoding: "base64",
            cid,
          });
        }
      }
    } catch (error) {
      throw new CustomError(
        "Error al generar los códigos QR de las entradas: " + (error as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    const html = template({
      cliente: orden.cliente,
      evento: orden.evento,
      fechaFormateada: FormatearFecha(orden.evento.fechaEvento),
      entradas,
    });

    try {
      await this.SendEmail(
        orden.cliente.email,
        `¡Disfruta tus entradas para ${orden.evento.nombre}!`,
        html,
        attachments
      );
    } catch (error) {
      throw new CustomError(
        "Error al enviar el correo con las entradas",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async SendUpdateEventEmail(eventId: number) {
    const filePath = path.resolve(
      __dirname,
      this.directorioEmailTemplates + "EventoActualizado.hbs"
    );
    if (!fs.existsSync(filePath)) {
      throw new CustomError(
        "No se encontró la plantilla del correo de evento actualizado",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    const source = fs.readFileSync(filePath, "utf-8");
    const template = Handlebars.compile(source);
    const evento = await this.eventoService.obtenerDetalleEvento(eventId);
    if (!evento) {
      throw new CustomError(
        "Evento no encontrado para enviar correos de actualización",
        StatusCodes.NOT_FOUND
      );
    }
    const html = template({
      evento: evento,
      fechaFormateada: FormatearFecha(evento.fechaEvento),
    });
    const emailsParaEnviar = await this.eventoService.obtenerEmailDeAsistentesAlEvento(eventId);
    console.log("Emails para enviar actualización de evento:", emailsParaEnviar);

    try {
      await this.SendEmailInBulk(
        emailsParaEnviar,
        `🔄 Actualización del evento: ${evento.nombre}`,
        html
      );
    } catch (error) {
      throw new CustomError(
        "Error al enviar el correo de actualización del evento",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async SendEventCancelledEmail(eventId: number) {
    const filePath = path.resolve(
      __dirname,
      this.directorioEmailTemplates + "EventoCancelado.hbs"
    );

    if (!fs.existsSync(filePath)) {
      throw new CustomError(
        "No se encontró la plantilla del correo de evento cancelado",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    const source = fs.readFileSync(filePath, "utf-8");
    const template = Handlebars.compile(source);

    const evento = await this.eventoService.obtenerDetalleEvento(eventId);
    if (!evento) {
      throw new CustomError(
        "Evento no encontrado para enviar correos de cancelación",
        StatusCodes.NOT_FOUND
      );
    }

    const html = template({
      evento: evento,
      fechaFormateada: FormatearFecha(evento.fechaEvento),
    });

    const emailsParaEnviar = await this.eventoService.obtenerEmailDeAsistentesAlEvento(eventId);

    try {
      await this.SendEmailInBulk(
        emailsParaEnviar,
        `🚫 Evento cancelado: ${evento.nombre}`,
        html
      );
    } catch (error) {
      throw new CustomError(
        "Error al enviar el correo de cancelación del evento",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

}
