/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ChargeBalanceDto } from './dto/charge-balance.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockUsersService = {
    chargeUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('chargeUser', () => {
    const mockDto: ChargeBalanceDto = {
      userId: 1,
      action: 'purchase',
      amount: 100,
    };

    it('should successfully charge user and return new balance', async () => {
      const expectedResult = { balance: 900 };
      mockUsersService.chargeUser.mockResolvedValue(expectedResult);

      const result = await controller.chargeUser(mockDto);

      expect(service.chargeUser).toHaveBeenCalledWith(mockDto);
      expect(service.chargeUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUsersService.chargeUser.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.chargeUser(mockDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.chargeUser(mockDto)).rejects.toThrow(
        'User not found',
      );

      expect(service.chargeUser).toHaveBeenCalledWith(mockDto);
    });

    it('should throw BadRequestException when user has insufficient funds', async () => {
      mockUsersService.chargeUser.mockRejectedValue(
        new BadRequestException('Insufficient funds'),
      );

      await expect(controller.chargeUser(mockDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.chargeUser(mockDto)).rejects.toThrow(
        'Insufficient funds',
      );

      expect(service.chargeUser).toHaveBeenCalledWith(mockDto);
    });

    it('should handle different charge amounts', async () => {
      const largeChargeDto: ChargeBalanceDto = {
        userId: 1,
        action: 'purchase',
        amount: 500,
      };
      const expectedResult = { balance: 500 };
      mockUsersService.chargeUser.mockResolvedValue(expectedResult);

      const result = await controller.chargeUser(largeChargeDto);

      expect(service.chargeUser).toHaveBeenCalledWith(largeChargeDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle different action types', async () => {
      const refundDto: ChargeBalanceDto = {
        userId: 1,
        action: 'refund',
        amount: 50,
      };
      const expectedResult = { balance: 950 };
      mockUsersService.chargeUser.mockResolvedValue(expectedResult);

      const result = await controller.chargeUser(refundDto);

      expect(service.chargeUser).toHaveBeenCalledWith(refundDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle different user IDs', async () => {
      const differentUserDto: ChargeBalanceDto = {
        userId: 2,
        action: 'purchase',
        amount: 100,
      };
      const expectedResult = { balance: 800 };
      mockUsersService.chargeUser.mockResolvedValue(expectedResult);

      const result = await controller.chargeUser(differentUserDto);

      expect(service.chargeUser).toHaveBeenCalledWith(differentUserDto);
      expect(result).toEqual(expectedResult);
    });
  });
});
