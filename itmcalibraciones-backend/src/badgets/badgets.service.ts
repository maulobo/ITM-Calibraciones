import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AddBadgetCommand } from './commands/add-badgets.command';
import { ResetBadgetCounterCommand } from './commands/reset-badget-counter.command';
import { UpdateBadgetCommand } from './commands/update-badgets.command';
import { AddBadgetDTO } from './dto/add-badgets.dto';
import { GetBadgetsDTO } from './dto/get-badgets.dto';
import { UpdateBadgetDto } from './dto/update-badgets.dto';
import { FindAllBadgetsQuery } from './queries/get-all-badgets.query';



@Injectable()
export class BadgetService {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        
    ) {}

    async addBadget(addBadgetDTO: AddBadgetDTO) { 
        try{
            return await this.commandBus.execute(new AddBadgetCommand(addBadgetDTO));
        }catch(e){
            console.log(e)
        }
    }

    async resetBadgetCounter() { 
        try{
            return await this.commandBus.execute(new ResetBadgetCounterCommand());
        }catch(e){
            console.log(e)
        }
    }

    async updateBadget(updateBadgetDto: UpdateBadgetDto) { 
        try{
            return await this.commandBus.execute(new UpdateBadgetCommand(updateBadgetDto));
        }catch(e){
            console.log(e)
        }
        
    }

    async getAllBadgets(getBadgetsDTO:GetBadgetsDTO) { 
        return this.queryBus.execute(new FindAllBadgetsQuery(getBadgetsDTO));
    }

}
