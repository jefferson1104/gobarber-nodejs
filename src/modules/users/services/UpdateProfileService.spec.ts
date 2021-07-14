import AppError from '@shared/errors/AppError';

import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider';
import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository';
import UpdateProfileService from './UpdateProfileService';

let fakeUsersRepository: FakeUsersRepository;
let fakeHashProvider: FakeHashProvider;
let updateProfile: UpdateProfileService;

describe('UpdateProfile', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeHashProvider = new FakeHashProvider();

    updateProfile = new UpdateProfileService(
      fakeUsersRepository,
      fakeHashProvider
    );
  })
  //teste atualizar perfil do usuario
  it('should be able to update the profile', async () => {
    const user =  await fakeUsersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com.br',
      password: '123456',
    });

    const updatedUser = await updateProfile.execute({
      user_id: user.id,
      name: 'John Tre',
      email: 'johntre@example.com.br'
    });

    expect(updatedUser.name).toBe('John Tre');
    expect(updatedUser.email).toBe('johntre@example.com.br');
  });

  //teste para caso o usuario nao existir
  it('should not be able update the profile from non-existing user', async () => {
    expect(
      updateProfile.execute({
        user_id: 'non-existing-ser-id',
        name: 'Test',
        email: 'teste@exemple.com'
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  //teste usuario nao pode atualizar para um email ja utilizado
  it('should not be able to change to another user email', async () => {
    await fakeUsersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com.br',
      password: '123456',
    });

    const user =  await fakeUsersRepository.create({
      name: 'Test',
      email: 'test@example.com.br',
      password: '123456',
    });

    await expect(
      updateProfile.execute({
      user_id: user.id,
      name: 'John Doe',
      email: 'johndoe@example.com.br',
    }),
    ).rejects.toBeInstanceOf(AppError);
  });

  //teste para alterar senha
  it('should be able to update the password', async () => {
    const user =  await fakeUsersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com.br',
      password: '123456',
    });

    const updatedUser = await updateProfile.execute({
      user_id: user.id,
      name: 'John Tre',
      email: 'johntre@example.com.br',
      old_password: '123456',
      password: '123123',
    });

    expect(updatedUser.password).toBe('123123');
  });

    //teste para nao permitir alterar senha sem informar a senha antiga
    it('should not be able to update the password without old password', async () => {
      const user =  await fakeUsersRepository.create({
        name: 'John Doe',
        email: 'johndoe@example.com.br',
        password: '123456',
      });

      await expect(updateProfile.execute({
        user_id: user.id,
        name: 'John Tre',
        email: 'johntre@example.com.br',
        password: '123123',
      })).rejects.toBeInstanceOf(AppError);
    });

    //teste para nao permitir alterar senha se informar a senha antiga errada
    it('should not be able to update the password with wrong old password', async () => {
      const user =  await fakeUsersRepository.create({
        name: 'John Doe',
        email: 'johndoe@example.com.br',
        password: '123456',
      });

      await expect(updateProfile.execute({
        user_id: user.id,
        name: 'John Tre',
        email: 'johntre@example.com.br',
        old_password: 'wrong-old-password',
        password: '123123',
      })).rejects.toBeInstanceOf(AppError);
    });
});
