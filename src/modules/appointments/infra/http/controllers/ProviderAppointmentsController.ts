import { Request, Response } from 'express';
import { container } from 'tsyringe';

import ListProviderAppointmentsService from '@modules/appointments/services/ListProviderAppointmentsService';
import { classToClass } from 'class-transformer';


export default class ProviderAppointmentsController {
  public async index(request: Request, response: Response): Promise<Response> {
    //recuperar usuario logado
    const provider_id = request.user.id;

    //pegando dados do usuario para criar appointments
    const { day, month, year } = request.query;

    const listProviderAppointments = container.resolve(
      ListProviderAppointmentsService
    );

    const appointments = await listProviderAppointments.execute({
      provider_id,
      day: Number(day),
      month: Number(month),
      year: Number(year),
    });

    //resutlado do appointment
    return response.json(classToClass(appointments));
  }
}
