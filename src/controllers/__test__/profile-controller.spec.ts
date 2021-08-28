import {Request} from 'express';
import faker from 'faker';

import {AuthResult} from '../../@types/models';
import {
  generateAuthProfile,
  generateRegisterProfile,
} from '../../@utils/fake-data';
import AuthService from '../../services/auth-service';
import ProfileService from '../../services/profile-service';
import {ProfileController} from '../profile-controller';

describe('ProfileController', () => {
  afterAll(() => jest.clearAllMocks());

  it('should get all profiles', async () => {
    const authProfiles = [generateAuthProfile(), generateAuthProfile()];
    const mock = jest
      .spyOn(ProfileService.prototype, 'getProfiles')
      .mockReturnValueOnce(new Promise(resolve => resolve(authProfiles)));
    const target = new ProfileController();
    const actual = await target.getAll();
    expect(actual).toStrictEqual(authProfiles);
    expect(mock).toBeCalledTimes(1);
  });

  it('should get my profile', async () => {
    const authProfile = generateAuthProfile();
    const request = {
      user: authProfile,
    };
    const target = new ProfileController();
    const actual = await target.me(request);
    expect(actual).toStrictEqual(authProfile);
  });

  it('should authorize using request', async () => {
    const authProfile = generateAuthProfile();
    const token = faker.random.alphaNumeric(64);
    const authResult: AuthResult = {
      profile: authProfile,
      token,
    };
    const request = {
      headers: {
        authorization: token,
      },
    };

    const mock = jest
      .spyOn(AuthService.prototype, 'authenticate')
      .mockReturnValueOnce(new Promise(resolve => resolve(authResult)));

    const target = new ProfileController();
    const actual = await target.auth(request as Request);

    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith(token);
    expect(actual).toStrictEqual(authResult);
  });

  it('should register my profile', async () => {
    const registerProfile = generateRegisterProfile();
    const authProfile = generateAuthProfile();

    const mock = jest
      .spyOn(ProfileService.prototype, 'register')
      .mockReturnValueOnce(new Promise(resolve => resolve(authProfile)));

    const target = new ProfileController();
    const actual = await target.register(registerProfile);

    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith(registerProfile);
    expect(actual.profile).toStrictEqual(authProfile);
  });
});
