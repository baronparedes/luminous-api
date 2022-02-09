import faker from 'faker';
import {Sequelize} from 'sequelize';

import {toTransactionPeriod} from '../../@utils/dates';
import {generateProperty} from '../../@utils/fake-data';
import {initInMemoryDb, SEED} from '../../@utils/seeded-test-data';
import usePaymentHistory from '../../hooks/views/use-payment-history';
import Transaction from '../../models/transaction-model';
import PropertyService from '../property-service';

jest.mock('../../hooks/views/use-payment-history');

describe('PropertyService', () => {
  let target: PropertyService;
  const property = faker.random.arrayElement(SEED.PROPERTIES);
  const profile = faker.random.arrayElement(SEED.PROFILES);
  const charge = faker.random.arrayElement(
    SEED.CHARGES.filter(c => c.chargeType === 'unit')
  );
  const seedTransactions = [
    {
      id: 1,
      amount: Number((property.floorArea * charge.rate).toFixed(2)),
      chargeId: charge.id,
      propertyId: property.id,
      transactionPeriod: toTransactionPeriod(2021, 'JAN'),
      transactionType: 'charged',
      rateSnapshot: charge.rate,
    },
    {
      id: 2,
      amount: Number((property.floorArea * charge.rate).toFixed(2)),
      chargeId: charge.id,
      propertyId: property.id,
      transactionPeriod: toTransactionPeriod(2021, 'JAN'),
      transactionType: 'collected',
      rateSnapshot: charge.rate,
    },
    {
      id: 3,
      amount: 1000,
      chargeId: charge.id,
      propertyId: property.id,
      transactionPeriod: toTransactionPeriod(2020, 'DEC'),
      transactionType: 'charged',
      rateSnapshot: charge.rate,
    },
    {
      id: 4,
      amount: 500,
      chargeId: charge.id,
      propertyId: property.id,
      transactionPeriod: toTransactionPeriod(2020, 'DEC'),
      transactionType: 'charged',
      rateSnapshot: charge.rate,
      waivedBy: Number(profile.id),
    },
  ];

  const usePaymentHistoryMock = usePaymentHistory as jest.MockedFunction<
    typeof usePaymentHistory
  >;

  beforeAll(async () => {
    const sequelize = await initInMemoryDb();
    target = new PropertyService(sequelize);
    await Transaction.bulkCreate([...seedTransactions]);
  });

  it('should get transaction history', async () => {
    const actual1 = await target.getTransactionHistory(property.id, 2021);
    const actual2 = await target.getTransactionHistory(property.id, 2020);
    const actual3 = await target.getTransactionHistory(property.id, 2019);
    expect(actual1).toHaveLength(2);
    expect(actual2).toHaveLength(1);
    expect(actual3).toHaveLength(0);
  });

  it('should get previous balance', async () => {
    const actual1 = await target.getPreviousYearBalance(property.id, 2021);
    const actual2 = await target.getPreviousYearBalance(property.id, 2020);
    const actual3 = await target.getPreviousYearBalance(property.id, 2019);
    expect(actual1).toEqual(1000);
    expect(actual2).toEqual(0);
    expect(actual3).toEqual(0);
  });

  it('should get payment history', async () => {
    const mockFn = jest.fn();
    usePaymentHistoryMock.mockImplementation(mockFn);
    await target.getPaymentHistory(1, 2020);
    expect(mockFn).toBeCalledWith(1, 2020, expect.any(Sequelize));
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
