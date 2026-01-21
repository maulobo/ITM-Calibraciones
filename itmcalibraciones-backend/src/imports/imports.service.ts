import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { BrandService } from 'src/brands/brands.service';
import { CityService } from 'src/city/city.service';
import { ICity } from 'src/city/interfaces/city.interface';
import { ClientService } from 'src/clients/clients.service';
import { AddOrUpdateClientDTO } from 'src/clients/dto/add-update-client.dto';
import { IClient } from 'src/clients/interfaces/client.interface';
import { EquipmentTypesService } from 'src/equipment-types/equipment-types.service';
import { AddEquipmentDTO } from 'src/equipment/dto/add-equipment.dto';
import { EquipmentService } from 'src/equipment/equipment.service';
import { StatusEnum } from 'src/errors-handler/enums/status.enum';
import { throwException } from 'src/errors-handler/throw-exception';
import { ModelService } from 'src/models/models.service';
import { AddOfficeDTO } from 'src/offices/dto/add-office.dto';
import { OfficeService } from 'src/offices/office.service';
import { ImportCitiesDTO, ImportCityDTO } from './dto/import-cities.dto';
import { ImportClientsDTO } from './dto/import-clients.dto';
import { ImportInstrumentsDTO } from './dto/import-instruments.dto';
import { ImportOfficesDTO } from './dto/import-offices.dto';


@Injectable()
export class ImportsService {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly cityService: CityService,
        private readonly clientService: ClientService,
        private readonly officeService: OfficeService,
        private readonly instrumentsService: EquipmentService,
        private readonly brandService: BrandService,
        private readonly modelService: ModelService,
        private readonly equipmentTypesService: EquipmentTypesService,
    ) {}
    
    async importInstruments(importInstrumentsDTO: ImportInstrumentsDTO) { 
        const { instruments } = importInstrumentsDTO;
        
        const allClients = await this.clientService.getAllClients({})

        const promises = instruments.map( async ( instrument ) => {
            let { serialNumber, range, model, brandName, modelName, instrumentTypeName, officeName, clientName } = instrument

            const ifExist = await this.instrumentsService.getAllEquipments({
                serialNumber
            })

            if( ifExist.length > 0 ) return
            
            let instrumentType

            const brands = await this.brandService.getAllBrands()
            
            const foundBrands = brands.find(( brand ) => {
                return brandName === brand.name
            });

            if( !foundBrands ){
                const newBrand = await this.brandService.addBrand({
                    name: brandName
                })

                const newModel = await this.modelService.addModel({
                    name: modelName,
                    brand: newBrand._id
                })

                model = newModel._id
            }else{
                const models = await this.modelService.getAllModels({
                    brand: foundBrands._id
                })

                if( models.length === 0){
                    const newModel = await this.modelService.addModel({
                        name: modelName,
                        brand: foundBrands._id
                    })

                    model = newModel._id
                }else{
                    const foundModel = models.find(( model ) => {
                        return modelName === model.name
                    });
                    if(!foundModel){
                        const newModel = await this.modelService.addModel({
                            name: modelName,
                            brand: foundBrands._id
                        })
                        model = newModel._id
                    }else{
                        model = foundModel._id
                    }
                    
                }
            }

            const instrumentsTypes = await this.equipmentTypesService.getAllEquipmentTypes()

            const foundType = instrumentsTypes.find(( type ) => {
                return instrumentTypeName === type.name
            });

            if( !foundType ){
                try{
                    const newInstrumentType = await this.equipmentTypesService.addEquipmentType({
                        type: instrumentTypeName
                    })
                    instrumentType = newInstrumentType._id
                }catch(e){
                    console.log(e)
                }
                
            }else{
                instrumentType = foundType._id
            }
            
            const clientFound = allClients.find(( client ) => {
                return clientName === client.socialReason
            });

            if(!clientFound){
                console.log({clientName})
                throwException(StatusEnum.CLIENT_NOT_EXIST);
            }

            

            const city = await this.cityService.findCities({ name: officeName })
            
            if( city.length === 0){
                console.log({officeName})
                throwException(StatusEnum.CITY_NOT_FOUND);
            }
        
            const offices = await this.officeService.getAllOffices({
                client: clientFound._id,
            })

            if( offices.length === 0){
                console.log("No se encontaron oficinas para:", {clientFound})
                throwException(StatusEnum.OFFICE_NOT_FOUND);
            }

            const officeFound = offices.find(( office ) => {
                return officeName === office.city.name
            });

            if(!officeFound){
                console.log({officeName})
                throwException(StatusEnum.OFFICE_NOT_FOUND);
            }

            try {
                const newInstrument:AddEquipmentDTO = {
                    serialNumber,
                    range,
                    model,
                    instrumentType,
                    office: officeFound._id
                }

                return this.instrumentsService.addEquipment(newInstrument)
            } catch (error) {
                throw error; // Re-lanzar el error para que sea manejado por el caller
            }
        });
    
        return await Promise.all(promises);
    }
    
    async importClients(importClientsDTO: ImportClientsDTO) { 
        const { clients } = importClientsDTO;
        const promises = clients.map(async (client) => {
            try {
                const params = {
                    name: client.cityName
                };
                const city: ICity[] = await this.cityService.findCities(params);
                
                if (city.length === 0) {
                    console.log({client, city});
                    throwException(StatusEnum.NOT_FOUND);
                }
    
                const { socialReason, cuit, responsable, phoneNumber } = client;
    
                const newClient: AddOrUpdateClientDTO = {
                    socialReason,
                    cuit,
                    responsable, 
                    phoneNumber, 
                    city: city[0]._id
                };

                const ifExist = await this.clientService.getAllClients({
                    cuit,
                    socialReason
                })

                if(ifExist.length > 0){
                    console.log("El client ya existe", socialReason, cuit)
                    return
                }

    
                return this.clientService.addClient(newClient);
            } catch (error) {
                throw error; // Re-lanzar el error para que sea manejado por el caller
            }
        });
    
        return await Promise.all(promises);
    }

    async importOffice(importOfficesDTO: ImportOfficesDTO) { 
        const { offices } = importOfficesDTO;
        const promises = offices.map(async (office) => {
            try {
                
                const clients: IClient[] = await this.clientService.getAllClients({});
                
                const foundClient = clients.find((client) => {
                    return client.socialReason === office.socialReason
                });

                if (!foundClient) {
                    console.log("Cliente no encontrado: ", office.socialReason, office);
                    throwException(StatusEnum.CLIENT_NOT_EXIST);
                }

                const params = {
                    name: office.cityName
                };

                const city: ICity[] = await this.cityService.findCities(params);
                
                if (city.length === 0) {
                    console.log({office, city});
                    console.log("Ciudad no encontrada: ", office.cityName);
                    throwException(StatusEnum.CITY_NOT_FOUND);
                }
    
                const {  responsable, phoneNumber } = office;
                
                const newOffice: AddOfficeDTO = {
                    client: foundClient._id,
                    responsable, 
                    phoneNumber, 
                    city: city[0]._id,
                    name: city[0].name
                };

                const ifExist = await this.officeService.getAllOffices({
                    client: foundClient._id
                })

                if(ifExist.length > 0 && ifExist.find( office => office.city._id.toString() === newOffice.city.toString()
                )){
                    console.log("La oficina ya existe", {foundClient}, {newOffice})
                    return
                }

    
                return this.officeService.addOffice(newOffice);
            } catch (error) {
                throw error; // Re-lanzar el error para que sea manejado por el caller
            }
        });
    
        return await Promise.all(promises);
    }

    async importCities(importCitiesDTO: ImportCitiesDTO) { 
        const { cities } = importCitiesDTO
        const states = await this.cityService.getAllStates()
        const promises = cities.map( async (city: ImportCityDTO) => {
            const foundState = states.find((state) => {
                return state.nombre === city.stateName
            });
            if (!foundState) {
                throwException(StatusEnum.NOT_FOUND);
            }
            city.state = foundState._id 

            await this.cityService.addCity(city);

        })

        return await Promise.all(promises);

    }

}
