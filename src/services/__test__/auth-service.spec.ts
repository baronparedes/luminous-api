import * as faker from 'faker';

import {generateAuthProfile} from '../../@utils/fake-data';
import AuthService from '../auth-service';
import ProfileService from '../profile-service';

describe('AuthService', () => {
  const mockedProfile = generateAuthProfile();

  function setupAuthService() {
    const username = faker.internet.userName();
    const password = faker.internet.password();
    const credentials = `${username}:${password}`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');
    const target = new AuthService();
    return {
      username,
      password,
      encodedCredentials,
      target,
    };
  }

  async function setupAuthentication() {
    const getProfileSpy = jest
      .spyOn(ProfileService.prototype, 'getProfileByUsernameAndPassword')
      .mockReturnValueOnce(new Promise(resolve => resolve(mockedProfile)));
    const {target, encodedCredentials, username, password} = setupAuthService();
    const actual = await target.authenticate(`Basic ${encodedCredentials}`);
    expect(getProfileSpy).toBeCalledTimes(1);
    expect(getProfileSpy).toBeCalledWith(username, password);
    return {
      target,
      actual,
    };
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should authenticate a valid profile', async () => {
    const {actual} = await setupAuthentication();
    expect(actual.profile).toStrictEqual(mockedProfile);
    expect(actual.token).toBeTruthy();
  });

  it('should verify an authorized token', async () => {
    const {target, actual} = await setupAuthentication();
    const authorized = await target.verifyAuthorization(
      `Bearer ${actual.token}`
    );
    expect(authorized.name).toBe(mockedProfile.name);
    expect(authorized.username).toBe(mockedProfile.username);
  });

  it('should reject invalid token', async () => {
    const target = new AuthService();
    await expect(
      target.verifyAuthorization(`Bearer ${faker.random.alphaNumeric(64)}`)
    ).rejects.toThrow();
  });

  it('should throw an error when profile is invalid', async () => {
    const getProfileSpy = jest
      .spyOn(ProfileService.prototype, 'getProfileByUsernameAndPassword')
      .mockReturnValueOnce(
        new Promise((_, reject) => reject(new Error('err')))
      );
    const {target, encodedCredentials, username, password} = setupAuthService();
    await expect(
      target.authenticate(`Basic ${encodedCredentials}`)
    ).rejects.toThrowError('err');
    expect(getProfileSpy).toBeCalledTimes(1);
    expect(getProfileSpy).toBeCalledWith(username, password);
  });
});
