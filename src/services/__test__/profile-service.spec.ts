import ProfileService from '../profile-service';

describe('ProfileService', () => {
  it('should get correct profile', async () => {
    const target = new ProfileService();
    const actual = await target.getProfile('', '');
    expect(actual.username).toBe('barspars');
    expect(actual.name).toBe('Baron Patrick Paredes');
    expect(actual.id).toBe(1);
  });
});
