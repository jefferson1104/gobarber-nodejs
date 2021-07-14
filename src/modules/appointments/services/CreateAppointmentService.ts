import { startOfHour, isBefore, getHours, format } from 'date-fns';
import { injectable, inject} from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Appointment from '../infra/typeorm/entities/Appointment';
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import IAppointmentsRepository from '../repositories/IAppointmentsRepository';
import INotificationsRepository from '@modules/notifications/repositories/INotificationsRepository';

//DTO - Data Transfer Object (recebendo informações)
interface IRequest {
  provider_id: string;
  user_id: string;
  date: Date;
}

@injectable()
class CreateAppointmentService {
  constructor(
    @inject('AppointmentsRepository')
    private appointmentsRepository : IAppointmentsRepository,

    @inject('NotificationsRepository')
    private notificationsRepository : INotificationsRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) {}

  //método execute, informa que esta criando um novo appointment
  public async execute({ date, provider_id, user_id }: IRequest): Promise<Appointment> {
    const appointmentDate = startOfHour(date);//regra de negocio para que o agendamento so acontece de hora em hora

    //verifica e nao permite criar um agendamento em data do passado
    if (isBefore(appointmentDate, Date.now())) {
      throw new AppError("You can't create an appointment on a past date.");
    }

    //verifica e nao permite um user criar um agendamento para ele mesmo como provider
    if (user_id === provider_id) {
      throw new AppError("You can't create an appointment whith yourself.");
    }

    //verifica e nao permite criar appointments antes das 8am e nem depois das 17pm
    if (getHours(appointmentDate) < 8 || getHours(appointmentDate) > 17) {
      throw new AppError("You can only create appointments between 8am and 5pm");
    }

    //verifica se ja existe algum appointment com com a data recebida
    const findAppointmentInSameDate = await this.appointmentsRepository.findByDate(
      appointmentDate,
      provider_id,
    );

    //tratativa de erros/excessoes: caso a data não estiver disponive, ou seja ja existir um appointment com a data retornar erro
    if (findAppointmentInSameDate) {
      throw new AppError('This appointment is already booked');
    }

    //Criando o objeto do appointment e salvando dados do objeto appointment no banco de dados
    const appointment = await this.appointmentsRepository.create({
      provider_id,
      user_id,
      date: appointmentDate,
    });

    //formatando a data
    const dateFormatted = format(appointmentDate, "dd/MM/yyyy 'as' HH:mm'h'");

    //enviando notificacao assim que um appointment e criado
    await this.notificationsRepository.create({
      recipient_id: provider_id,
      content: `Novo agendamento para dia ${dateFormatted}`,
    });

    await this.cacheProvider.invalidate(`provider-appointments:${provider_id}:${format(appointmentDate, 'yyyy-M-d')}`);

    return appointment;
  }
}

export default CreateAppointmentService;


/**
 * TUDO QUE É REGRA DE NEGOCIO,
 * TUDO QUE FOR LOGICA DE PROGRAMAÇÃO
 * È COMPETENCIA DO SERVICE TRATAR
 *
 * cada service criado deve conter apenas uma unica exclusiva funcionalidade
 * entao para cada logica e regra de negocio crie um service responsavel
 *
*/
