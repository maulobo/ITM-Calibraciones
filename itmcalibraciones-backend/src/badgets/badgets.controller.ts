import {
  Body,
  Controller, Get, HttpCode, Param, Patch, Post, Put, Query
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { UserRoles } from 'src/common/enums/role.enum';
import { convertToObjectId } from 'src/common/utils/common-functions';
import { BadgetService } from './badgets.service';
import { AddBadgetDTO } from './dto/add-badgets.dto';
import { GetBadgetsDTO } from './dto/get-badgets.dto';
import { UpdateBadgetDto } from './dto/update-badgets.dto';
import { SendBudgetDto } from './dto/send-budget.dto';
import { UpdateBadgetStatusDto } from './dto/update-status.dto';
import { IBadget } from './interfaces/badgets.interface';
  
              
  @Auth()
  @Controller('badgets')
  export class BadgetController {
    constructor(
      private badgetService: BadgetService,
    ) {}

    @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
    @Post("/")
    async addBadget(
      @Body() addBadgetDTO: AddBadgetDTO,
    ): Promise<IBadget> {
      
      addBadgetDTO = convertToObjectId(addBadgetDTO)

      try{
        return await this.badgetService.addBadget(addBadgetDTO);
      }catch(e){
        console.log(e)
      }
    }

    @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
    @Put("/")
    async updateBadget(
      @Body() updateBadgetDto: UpdateBadgetDto,
    ): Promise<IBadget> {
      
      updateBadgetDto = convertToObjectId(updateBadgetDto)

      try{
        return await this.badgetService.updateBadget(updateBadgetDto);
      }catch(e){
        console.log(e)
      }
      
    }

    @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
    @Post("/:id/send")
    @HttpCode(204)
    async sendBudget(
      @Param("id") id: string,
      @Body() dto: SendBudgetDto,
    ): Promise<void> {
      return this.badgetService.sendBudget(id, dto);
    }

    @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
    @Patch("/:id/status")
    async updateStatus(
      @Param("id") id: string,
      @Body() body: Pick<UpdateBadgetStatusDto, "status">,
    ): Promise<IBadget> {
      return this.badgetService.updateStatus({ id, status: body.status });
    }

    @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
    @Get("/")
    async getBadgets(
      @Query() getBadgetsDTO:GetBadgetsDTO,
      @User() user: JwtPayload,
    ): Promise<IBadget[]> {
      getBadgetsDTO = convertToObjectId(getBadgetsDTO)
      return await this.badgetService.getAllBadgets(getBadgetsDTO);
    }

    @Auth()
    @Get("/by-equipment/:equipmentId")
    async getByEquipment(
      @Param("equipmentId") equipmentId: string,
      @User() user: JwtPayload,
    ): Promise<IBadget[]> {
      const isPortalUser = user.roles?.includes(UserRoles.USER) && !user.roles?.includes(UserRoles.ADMIN) && !user.roles?.includes(UserRoles.TECHNICAL);
      const officeId = isPortalUser ? user.office?.toString() : undefined;
      return this.badgetService.getByEquipment(equipmentId, officeId);
    }

    // ── Portal endpoints (USER role — client) ─────────────────────────────────

    @Auth(UserRoles.USER)
    @Get("/portal")
    async getPortalBudgets(@User() user: JwtPayload): Promise<IBadget[]> {
      const officeId = user.office?.toString();
      if (!officeId) return [];
      return this.badgetService.getClientBudgets(officeId);
    }

    @Auth(UserRoles.USER)
    @HttpCode(200)
    @Patch("/:id/client-approve")
    async clientApprove(
      @Param("id") id: string,
      @User() user: JwtPayload,
    ): Promise<IBadget> {
      return this.badgetService.clientApprove(id, user.office?.toString(), {
        name: user.name,
        lastName: user.lastName,
        email: user.email,
      });
    }

    @Auth(UserRoles.USER)
    @HttpCode(200)
    @Patch("/:id/client-reject")
    async clientReject(
      @Param("id") id: string,
      @User() user: JwtPayload,
      @Body() body: { rejectionReason?: string },
    ): Promise<IBadget> {
      return this.badgetService.clientReject(id, user.office?.toString(), body.rejectionReason);
    }

  }
  