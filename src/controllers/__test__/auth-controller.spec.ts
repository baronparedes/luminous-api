import {Request} from 'express';
import faker from 'faker';

import {AuthResult} from '../../@types/models';
import {generateAuthProfile} from '../../@utils/fake-data';
import AuthService from '../../services/auth-service';
import {AuthController} from '../auth-controller';

describe('AuthController', () => {
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

    const target = new AuthController();
    const actual = await target.auth(request as Request);

    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith(token);
    expect(actual).toStrictEqual(authResult);
  });
});
