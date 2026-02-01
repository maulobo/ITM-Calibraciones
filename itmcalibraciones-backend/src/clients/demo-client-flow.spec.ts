import { Test, TestingModule } from "@nestjs/testing";
import {
  AddClientCommand,
  AddClientCommandHandler,
} from "./commands/add-update-client.command";
import { getModelToken } from "@nestjs/mongoose";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ClientsEntity } from "./schemas/clients.schema";
import { CreateUserCommand } from "../users/commands/impl/create-user.command";
import { Types } from "mongoose";
import { FindAllOfficesQuery } from "../offices/queries/get-all-offices.query";

describe("Simulacion: Creacion de Cliente Ficticio y Usuario Automatico", () => {
  let handler: AddClientCommandHandler;
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let saveSpy: jest.Mock;

  // Datos del Cliente Ficticio
  const CLIENTE_FICTICIO = {
    socialReason: "Industrias Stark S.A.",
    cuit: "30-12345678-9",
    email: "tony@stark.com",
    city: new Types.ObjectId(), // ID simulado de ciudad
    responsable: "Tony Stark",
    phoneNumber: "11-5555-8888",
    id: undefined,
  };

  beforeEach(async () => {
    saveSpy = jest.fn().mockResolvedValue({
      ...CLIENTE_FICTICIO,
      _id: new Types.ObjectId(),
      toObject: () => ({ ...CLIENTE_FICTICIO, _id: new Types.ObjectId() }),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddClientCommandHandler,
        {
          provide: getModelToken("Client"),
          useValue: function () {
            this.save = saveSpy;
          },
        },
        {
          provide: CommandBus,
          useValue: { execute: jest.fn() },
        },
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn().mockImplementation((query) => {
              if (query instanceof FindAllOfficesQuery) {
                return [{ _id: new Types.ObjectId(), name: "Oficina Central" }];
              }
              return [];
            }),
          },
        },
      ],
    }).compile();

    handler = module.get<AddClientCommandHandler>(AddClientCommandHandler);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('>> DEBE crear el cliente "Industrias Stark" y su Usuario asociado', async () => {
    console.log(
      `\n🔵 Intentando crear cliente: ${CLIENTE_FICTICIO.socialReason}`,
    );
    console.log(`   CUIT: ${CLIENTE_FICTICIO.cuit}`);
    console.log(`   Email: ${CLIENTE_FICTICIO.email}`);

    // Ejecutamos el comando
    await handler.execute(new AddClientCommand(CLIENTE_FICTICIO as any));

    // 1. Verificamos que se guardó el cliente
    expect(saveSpy).toHaveBeenCalled();
    console.log("✅ Cliente guardado en Base de Datos.");

    // 2. Verificamos que se disparó la creación de usuario
    // La contraseña esperada es solo numeros del CUIT + 'itm'
    const expectedPassword = "30123456789itm";

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(CreateUserCommand),
    );

    const callArgs = (commandBus.execute as jest.Mock).mock.calls[0][0];
    const userPayload = callArgs.userDto;

    console.log("✅ Comando de Crear Usuario disparado automaticamente.");
    console.log("   Datos del Usuario Generado:");
    console.log(`   -> Nombre: ${userPayload.name}`);
    console.log(`   -> Email (Usuario): ${userPayload.email}`);
    console.log(
      `   -> Password Generada: ${userPayload.password} (CUIT nums + "itm")`,
    );
    console.log(`   -> Rol: ${userPayload.role}`);

    expect(userPayload.email).toBe(CLIENTE_FICTICIO.email);
    expect(userPayload.password).toBe(expectedPassword);
  });
});
