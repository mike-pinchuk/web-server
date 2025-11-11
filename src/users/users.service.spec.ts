/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { PaymentHistory } from './payment-history.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ChargeBalanceDto } from './dto/charge-balance.dto';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;
  let paymentHistoryRepository: jest.Mocked<Repository<PaymentHistory>>;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockPaymentHistoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(PaymentHistory),
          useValue: mockPaymentHistoryRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
    paymentHistoryRepository = module.get(getRepositoryToken(PaymentHistory));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should seed default user when user does not exist', async () => {
      const mockUser = { id: 1, balance: 1000 };
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser as User);
      mockUserRepository.save.mockResolvedValue(mockUser as User);

      await service.onModuleInit();

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        id: 1,
        balance: 1000,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should not seed when user already exists', async () => {
      const existingUser = { id: 1, balance: 1000 };
      mockUserRepository.findOne.mockResolvedValue(existingUser as User);

      await service.onModuleInit();

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('chargeUser', () => {
    const mockDto: ChargeBalanceDto = {
      userId: 1,
      action: 'purchase',
      amount: 100,
    };

    it('should successfully charge user and create payment history', async () => {
      const mockUser = { id: 1, balance: 1000 };
      const mockPaymentRecord = {
        id: 1,
        user: mockUser,
        action: 'purchase',
        amount: -100,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser as User);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        balance: 900,
      } as User);
      mockPaymentHistoryRepository.create.mockReturnValue(
        mockPaymentRecord as PaymentHistory,
      );
      mockPaymentHistoryRepository.save.mockResolvedValue(
        mockPaymentRecord as PaymentHistory,
      );

      const result = await service.chargeUser(mockDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        id: 1,
        balance: 900,
      });
      expect(mockPaymentHistoryRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        action: 'purchase',
        amount: -100,
      });
      expect(mockPaymentHistoryRepository.save).toHaveBeenCalledWith(
        mockPaymentRecord,
      );
      expect(result).toEqual({ balance: 900 });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.chargeUser(mockDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.chargeUser(mockDto)).rejects.toThrow(
        'User not found',
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(mockPaymentHistoryRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when user has insufficient funds', async () => {
      const mockUser = { id: 1, balance: 50 };
      mockUserRepository.findOne.mockResolvedValue(mockUser as User);

      await expect(service.chargeUser(mockDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.chargeUser(mockDto)).rejects.toThrow(
        'Insufficient funds',
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(mockPaymentHistoryRepository.create).not.toHaveBeenCalled();
    });

    it('should handle exact balance charge', async () => {
      const mockUser = { id: 1, balance: 100 };
      const mockPaymentRecord = {
        id: 1,
        user: mockUser,
        action: 'purchase',
        amount: -100,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser as User);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        balance: 0,
      } as User);
      mockPaymentHistoryRepository.create.mockReturnValue(
        mockPaymentRecord as PaymentHistory,
      );
      mockPaymentHistoryRepository.save.mockResolvedValue(
        mockPaymentRecord as PaymentHistory,
      );

      const result = await service.chargeUser(mockDto);

      expect(result).toEqual({ balance: 0 });
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        id: 1,
        balance: 0,
      });
    });
  });
});
