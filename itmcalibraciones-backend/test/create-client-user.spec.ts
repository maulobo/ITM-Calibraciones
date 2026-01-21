import { Test } from "@nestjs/testing";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { getModelToken } from "@nestjs/mongoose";
import {
  AddClientCommandHandler,
  AddClientCommand,
} from "../src/clients/commands/add-update-client.command";
import { CreateUserCommand } from "../src/users/commands/impl/create-user.command";
import { FindAllOfficesQuery } from "../src/offices/queries/get-all-offices.query";

const mockClientModel = {
  findOneAndUpdate: jest.fn(),
  prototype: {
    save: jest.fn(),
  },
};

describe("AddClientCommandHandler", () => {
  let handler: AddClientCommandHandler;
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let saveSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Reset mocks
    mockClientModel.prototype.save.mockReset();

    // Create module
    const moduleRef = await Test.createTestingModule({
      providers: [
        AddClientCommandHandler,
        {
          provide: getModelToken("Client"),
          useValue: function MockClient(dto) {
            this.data = dto;
            this.save = mockClientModel.prototype.save;
          },
        },
        {
          provide: CommandBus,
          useValue: { execute: jest.fn() },
        },
        {
          provide: QueryBus,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    handler = moduleRef.get<AddClientCommandHandler>(AddClientCommandHandler);
    commandBus = moduleRef.get<CommandBus>(CommandBus);
    queryBus = moduleRef.get<QueryBus>(QueryBus);
    saveSpy = mockClientModel.prototype.save;
  });

  it("should create a client and trigger user creation if email is present", async () => {
    // Setup
    const clientData = {
      socialReason: "Empresa Test",
      cuit: "30-12345678-9",
      email: "test@empresa.com",
      city: "city123",
    };
    const createdClient = { ...clientData, _id: "client123" };

    saveSpy.mockResolvedValue(createdClient);

    // Mock Office Query
    (queryBus.execute as jest.Mock).mockResolvedValue([{ _id: "office123" }]);

    // Execute
    await handler.execute(new AddClientCommand(clientData as any));

    // Verify Client Saved
    expect(saveSpy).toHaveBeenCalled();

    // Verify Office Query
    expect(queryBus.execute).toHaveBeenCalledWith(
      expect.any(FindAllOfficesQuery),
    );

    // Verify User Creation
    const expectedPassword = "30123456789itm";
    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(CreateUserCommand),
    );
    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        userDto: expect.objectContaining({
          email: clientData.email,
          password: expectedPassword,
          client: "client123",
          office: "office123",
        }),
      }),
    );
  });

  it("should create client BUT NOT user if email is missing", async () => {
    // Setup
    const clientData = {
      socialReason: "Empresa Sin Mail",
      cuit: "30-11111111-1",
      // No email
      city: "city123",
    };

    saveSpy.mockResolvedValue({ ...clientData, _id: "clientNoMail" });

    // Execute
    await handler.execute(new AddClientCommand(clientData as any));

    // Verify Client Saved
    expect(saveSpy).toHaveBeenCalled();

    // Verify NO User Creation
    expect(commandBus.execute).not.toHaveBeenCalled();
  });
});
