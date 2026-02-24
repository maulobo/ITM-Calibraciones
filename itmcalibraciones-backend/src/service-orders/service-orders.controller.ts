import { Controller, Post, Body, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ServiceOrdersService } from "./service-orders.service";
import { CreateServiceOrderDto } from "./dto/create-service-order.dto";
import { UpdateServiceOrderDto } from "./dto/update-service-order.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../auth/decorators/user.decorator";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { UserRoles } from "../common/enums/role.enum";

@ApiTags("Service Orders")
@Controller("service-orders")
@UseGuards(JwtAuthGuard)
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Post()
  create(
    @Body() createServiceOrderDto: CreateServiceOrderDto,
    @User() user: JwtPayload,
  ) {
    return this.serviceOrdersService.create(createServiceOrderDto, user);
  }

  @Get()
  findAll(
    @User() user: JwtPayload,
    @Query("client") clientId?: string,
  ) {
    const isPortalUser = user.roles.includes(UserRoles.USER)
      && !user.roles.includes(UserRoles.ADMIN)
      && !user.roles.includes(UserRoles.TECHNICAL);

    // Portal clients can only see their own orders — enforced from JWT, not from query param
    const resolvedClientId = isPortalUser
      ? (user.client?.toString() ?? undefined)
      : clientId;

    return this.serviceOrdersService.findAll(resolvedClientId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.serviceOrdersService.findOne(id);
  }

  @Patch(":id")
  updateStatus(
    @Param("id") id: string,
    @Body() updateServiceOrderDto: UpdateServiceOrderDto,
    @User() user: JwtPayload,
  ) {
    return this.serviceOrdersService.updateStatus(id, updateServiceOrderDto, user);
  }
}
