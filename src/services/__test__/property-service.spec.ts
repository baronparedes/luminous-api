import faker from 'faker';

import {generateProperty} from '../../@utils/fake-data';
import {initInMemoryDb, SEED} from '../../@utils/seeded-test-data';
import PropertyService from '../property-service';

describe('PropertyService', () => {
  let target: PropertyService;
  const property = faker.random.arrayElement(SEED.PROPERTIES);
  const profile = faker.random.arrayElement(SEED.PROFILES);

  beforeAll(async () => {
    const sequelize = await initInMemoryDb();
    target = new PropertyService(sequelize);
  });

  it('should get property', async () => {
    const actual = await target.get(property.id);
    expect(actual).toBeDefined();
  });

  it('should get all properties with search criteria', async () => {
    const actual = await target.getAll(property.code);
    expect(actual?.length).toEqual(1);
  });

  describe('when managing property assignments', () => {
    it('should manage property assignments correctly', async () => {
      const assignments1 = await target.getAssignments(property.id);
      expect(assignments1.length).toEqual(0);

      await target.updateAssignments(property.id, [Number(profile.id)]);
      const assignments2 = await target.getAssignments(property.id);
      expect(assignments2.length).toEqual(1);
      expect(assignments2[0].profileId).toEqual(profile.id);

      await target.updateAssignments(property.id, []);
      const assignments3 = await target.getAssignments(property.id);
      expect(assignments3.length).toEqual(0);
    });

    it('should get assigned properties for a profile', async () => {
      await target.updateAssignments(property.id, [Number(profile.id)]);
      const assignments = await target.getAssignments(property.id);
      expect(assignments.length).toEqual(1);
      expect(assignments[0].profileId).toEqual(profile.id);

      const actual = await target.getAssignedProperies(Number(profile.id));
      expect(actual.length).toEqual(1);
      expect(actual[0].propertyId).toEqual(property.id);
    });
  });

  describe('when managing properties', () => {
    let newPropertyId: number;
    const newProperty = generateProperty();

    beforeAll(async () => {
      const actual = await target.create({
        address: newProperty.address,
        code: newProperty.code,
        floorArea: newProperty.floorArea,
        status: newProperty.status,
      });
      newPropertyId = Number(actual.id);
      expect(actual).toBeDefined();
    });

    it('should be able to create', async () => {
      const properties = await target.getAll();
      const actual = properties.find(p => p.id === newPropertyId);
      expect(actual).toBeDefined();
    });

    it('should be able to update', async () => {
      const udpated = generateProperty();
      await target.update(newPropertyId, {
        address: udpated.address,
        code: udpated.code,
        floorArea: udpated.floorArea,
        status: udpated.status,
      });

      const properties = await target.getAll();
      const actual = properties.find(p => p.id === newPropertyId);
      expect(actual).toBeDefined();
      expect(actual?.address).toEqual(udpated.address);
      expect(actual?.code).toEqual(udpated.code);
      expect(actual?.floorArea).toEqual(udpated.floorArea);
      expect(actual?.status).toEqual(udpated.status);
    });

    it('should update property status', async () => {
      await target.updateStatus(newPropertyId, 'inactive');
      const properties = await target.getAll();
      const actual = properties.find(p => p.id === newPropertyId);
      expect(actual).toBeDefined();
      expect(actual?.status).toEqual('inactive');
    });
  });
});
