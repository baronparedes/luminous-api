import {generateProfile} from '../../@utils/fake-data';
import {useHash} from '../../@utils/use-hash';
import Profile from '../../models/profile';
import ProfileService from '../profile-service';

jest.mock('../../models/profile');

describe.skip('ProfileService', () => {
  it('should get correct profile', async () => {
    const {hash} = useHash();
    const profile = generateProfile();
    const mockedProfile = new Profile({
      ...profile,
      password: hash(profile.password),
    });
    const mock = jest
      .spyOn(Profile, 'findOne')
      .mockReturnValueOnce(new Promise(resolve => resolve(mockedProfile)));
    const target = new ProfileService();
    const actual = await target.getProfileByUsernameAndPassword(
      profile.username,
      profile.password
    );
    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith({where: {username: profile.username}});
    expect(actual.username).toBe(profile.username);
    expect(actual.name).toBe(profile.email);
    expect(actual.id).toBe(profile.id);
  });
});
