import { Controller, Post, Body, Get, Param, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ServiceOrdersService } from "./service-orders.service";
import { CreateServiceOrderDto } from "./dto/create-service-order.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../auth/decorators/user.decorator";

@ApiTags("Service Orders")
@Controller("service-orders")
@UseGuards(JwtAuthGuard)
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Post()
  create(
    @Body() createServiceOrderDto: CreateServiceOrderDto,
    @User() user: any,
  ) {
    return this.serviceOrdersService.create(createServiceOrderDto, user);
  }

  @Get()
  findAll() {
    return this.serviceOrdersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.serviceOrdersService.findOne(id);
  }
}
