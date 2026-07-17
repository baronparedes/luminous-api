import faker from 'faker';

import {generateProfile} from '../../@utils/fake-data';
import {
  initInMemoryDb,
  PROFILE_CREDS,
  SEED,
} from '../../@utils/seeded-test-data';
import {VERBIAGE} from '../../constants';
import ProfileService from '../profile-service';

describe('ProfileService', () => {
  const target = new ProfileService();

  beforeAll(async () => {
    await initInMemoryDb();
  });

  it('should get all profiles', async () => {
    const searchCriteria = 'test';
    const actual = await target.getAll(searchCriteria);
    expect(actual.length).toBe(4);
  });

  describe('when fetching a profile by username and password', () => {
    it('should get correct profile', async () => {
      const expected = faker.random.arrayElement(SEED.PROFILES);
      const actual = await target.getProfileByUsernameAndPassword(
        expected.username,
        PROFILE_CREDS
      );
      expect(actual.id).toEqual(expected.id);
    });

    it('should throw an error when profile is not found', async () => {
      await expect(
        target.getProfileByUsernameAndPassword(
          faker.internet.userName(),
          PROFILE_CREDS
        )
      ).rejects.toThrow(VERBIAGE.NOT_FOUND);
    });

    it('should throw an error when profile password does not match', async () => {
      const expected = faker.random.arrayElement(SEED.PROFILES);
      await expect(
        target.getProfileByUsernameAndPassword(
          expected.username,
          faker.internet.password()
        )
      ).rejects.toThrow(VERBIAGE.NOT_FOUND);
    });
  });

  describe('when managing profiles', () => {
    let newProfileId: number;
    const newProfile = generateProfile();
    let currentPassword = newProfile.password;

    beforeAll(async () => {
      const actual = await target.register({
        email: newProfile.email,
        name: newProfile.name,
        password: currentPassword,
        username: newProfile.username,
        mobileNumber: newProfile.mobileNumber,
      });
      newProfileId = actual.id;
      expect(actual).toBeDefined();
    });

    it('should change profile password', async () => {
      const newPassword = faker.internet.password();
      await target.changePassword(newProfileId, currentPassword, newPassword);
      const actual = await target.getProfileByUsernameAndPassword(
        newProfile.username,
        newPassword
      );
      currentPassword = newPassword;
      expect(actual.id).toEqual(newProfileId);
    });

    it('should reset password', async () => {
      currentPassword = await target.resetPassword(
        newProfile.username,
        newProfile.email
      );
      const actual = await target.getProfileByUsernameAndPassword(
        newProfile.username,
        currentPassword
      );
      expect(actual.id).toEqual(newProfileId);
    });

    it('should be able to register', async () => {
      const profiles = await target.getAll();
      const actual = profiles.find(p => p.id === newProfileId);
      expect(actual).toBeDefined();
    });

    it('should update profile status', async () => {
      await target.updateStatus(newProfileId, 'inactive');
      const profiles = await target.getAll();
      const actual = profiles.find(p => p.id === newProfileId);
      expect(actual).toBeDefined();
      expect(actual?.status).toEqual('inactive');
    });

    it('should update profile', async () => {
      const updatedProfile = generateProfile();
      await target.update(newProfileId, {
        email: updatedProfile.email,
        name: updatedProfile.name,
        status: updatedProfile.status,
        type: updatedProfile.type,
        mobileNumber: updatedProfile.mobileNumber,
      });

      const profiles = await target.getAll();
      const actual = profiles.find(p => p.id === newProfileId);
      expect(actual).toBeDefined();
      expect(actual?.email).toEqual(updatedProfile.email);
      expect(actual?.name).toEqual(updatedProfile.name);
      expect(actual?.status).toEqual(updatedProfile.status);
      expect(actual?.type).toEqual(updatedProfile.type);
      expect(actual?.mobileNumber).toEqual(updatedProfile.mobileNumber);
    });

    it('should throw an error when profile is not found', async () => {
      const updatedProfile = generateProfile();
      await expect(
        target.update(faker.datatype.number(), {
          email: updatedProfile.email,
          name: updatedProfile.name,
          status: updatedProfile.status,
          type: updatedProfile.type,
          mobileNumber: updatedProfile.mobileNumber,
        })
      ).rejects.toThrow(VERBIAGE.NOT_FOUND);
    });
  });
});
