import { Request, Response } from 'express';
import { container } from 'tsyringe';

import CreateAppointmentService from '@modules/appointments/services/CreateAppointmentService';


export default class AppointmentsController {
  public async create(request: Request, response: Response): Promise<Response> {
    //recuperar usuario logado
    const user_id = request.user.id;

    //pegando dados do usuario para criar appointments
    const { provider_id, date } = request.body;

    const CreateAppointment = container.resolve(CreateAppointmentService)

    const appointment = await CreateAppointment.execute({
      date,
      provider_id,
      user_id,
    });

    //resutlado do appointment
    return response.json(appointment);
  }
}
