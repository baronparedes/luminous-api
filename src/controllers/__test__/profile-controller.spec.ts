import {AuthResult, Profile} from '../../@types/models';

import AuthService from '../../services/auth-service';
import {ProfileController} from '../profile-controller';
import {Request} from 'express';
import faker from 'faker';

describe('ProfileController', () => {
  afterAll(() => jest.clearAllMocks());

  it('should get my profile', async () => {
    const authProfile: Profile = {
      name: faker.name.findName(),
      username: faker.internet.userName(),
    };
    const request = {
      user: authProfile,
    };
    const target = new ProfileController();
    const actual = await target.me(request);
    expect(actual).toStrictEqual(authProfile);
  });

  it('should authorize using request', async () => {
    const authProfile: Profile = {
      name: faker.name.findName(),
      username: faker.internet.userName(),
    };
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

    const authenticateSpy = jest
      .spyOn(AuthService.prototype, 'authenticate')
      .mockReturnValueOnce(new Promise(resolve => resolve(authResult)));

    const target = new ProfileController();
    const actual = await target.auth(request as Request);

    expect(authenticateSpy).toBeCalledTimes(1);
    expect(authenticateSpy).toBeCalledWith(token);
    expect(actual).toStrictEqual(authResult);
  });
});
