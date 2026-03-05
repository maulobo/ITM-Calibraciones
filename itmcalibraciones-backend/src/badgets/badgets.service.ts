import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EmailService } from 'src/email/email.service';
import { EmailTemplate } from 'src/email/enum/email-template.enum';
import { AddBadgetCommand } from './commands/add-badgets.command';
import { ResetBadgetCounterCommand } from './commands/reset-badget-counter.command';
import { UpdateBadgetCommand } from './commands/update-badgets.command';
import { AddBadgetDTO } from './dto/add-badgets.dto';
import { GetBadgetsDTO } from './dto/get-badgets.dto';
import { SendBudgetDto } from './dto/send-budget.dto';
import { UpdateBadgetDto } from './dto/update-badgets.dto';
import { UpdateBadgetStatusDto } from './dto/update-status.dto';
import { IBadget } from './interfaces/badgets.interface';
import { FindAllBadgetsQuery } from './queries/get-all-badgets.query';



@Injectable()
export class BadgetService {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        @InjectModel('Badget') private readonly badgetModel: Model<IBadget>,
        private readonly emailService: EmailService,
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

    async updateStatus(dto: UpdateBadgetStatusDto): Promise<IBadget> {
        const budget = await this.badgetModel.findByIdAndUpdate(
            dto.id,
            { $set: { status: dto.status } },
            { new: true },
        );
        if (!budget) throw new NotFoundException(`Presupuesto ${dto.id} no encontrado`);
        return budget;
    }

    async sendBudget(id: string, dto: SendBudgetDto): Promise<void> {
        const budget = await this.badgetModel
            .findById(id)
            .populate({ path: 'office', populate: { path: 'client' } })
            .populate('advisor')
            .lean();

        if (!budget) throw new NotFoundException(`Presupuesto ${id} no encontrado`);

        const office = budget.office as any;
        const clientId = office?.client?._id;

        // Set client reference so the budget appears in the client portal
        if (clientId) {
            await this.badgetModel.findByIdAndUpdate(id, { $set: { client: clientId } });
        }

        const code = `${String(budget.year).padStart(2, '0')}-${String(budget.number).padStart(5, '0')}`;
        const grandTotal = budget.details?.reduce((acc, d) => acc + d.totalPrice, 0) ?? 0;
        const currencySymbol = budget.currency === 'USD' ? 'U$D' : '$';

        const detailsWithCurrency = budget.details?.map(d => ({
            ...d,
            currency: currencySymbol,
            unitPrice: d.unitPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 }),
            totalPrice: d.totalPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 }),
        })) ?? [];

        const portalUrl = process.env.FRONT_URL ?? '';

        const locals = {
            title: `Presupuesto ${code} - Calibraciones ITM`,
            code,
            date: budget.date ? new Date(budget.date).toLocaleDateString('es-AR') : '',
            reference: budget.reference,
            attention: budget.attention,
            paymentTerms: budget.paymentTerms,
            offerValidity: budget.offerValidity,
            deliveryTime: budget.deliveryTime,
            showTotal: budget.showTotal,
            currency: currencySymbol,
            grandTotal: grandTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 }),
            details: detailsWithCurrency,
            portalLink: `${portalUrl}/portal/budgets/${id}`,
        };

        const html = await this.emailService.compileTemplate(
            EmailTemplate.BUDGET_NOTIFICATION,
            locals,
        );

        for (const to of dto.recipients) {
            await this.emailService.sendEmail({ html, subject: `Presupuesto ${code} - Calibraciones ITM`, to });
        }
    }

    async getClientBudgets(officeId: string): Promise<IBadget[]> {
        return this.badgetModel
            .find({ office: new Types.ObjectId(officeId) })
            .populate({ path: 'office', populate: { path: 'client' } })
            .populate('advisor')
            .sort({ createdAt: -1 })
            .lean({ virtuals: true }) as unknown as IBadget[];
    }

    async clientApprove(id: string, officeId: string, user: { name: string; lastName: string; email: string }): Promise<IBadget> {
        const budget = await this.badgetModel.findById(id).lean({ virtuals: true });
        if (!budget) throw new NotFoundException(`Presupuesto ${id} no encontrado`);
        if (budget.office?.toString() !== officeId) throw new ForbiddenException('Sin acceso a este presupuesto');
        if (budget.status !== 'PENDING') throw new BadRequestException('El presupuesto ya fue procesado');

        const approvedAt = new Date();
        const approvedBy = `${user.name} ${user.lastName}`.trim();

        const updated = await this.badgetModel
            .findByIdAndUpdate(
                id,
                { $set: { status: 'APPROVED', approvedBy, approvedAt } },
                { new: true },
            )
            .lean({ virtuals: true }) as unknown as IBadget;

        // Send confirmation email
        try {
            const code = (updated as any).code ?? id;
            const grandTotal = budget.details?.reduce((acc, d) => acc + d.totalPrice, 0) ?? 0;
            const currencySymbol = budget.currency === 'USD' ? 'U$D' : '$';
            const detailsWithCurrency = budget.details?.map(d => ({
                ...d,
                currency: currencySymbol,
                unitPrice: d.unitPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 }),
                totalPrice: d.totalPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 }),
            })) ?? [];

            const locals = {
                title: `Presupuesto ${code} aprobado - Calibraciones ITM`,
                code,
                date: budget.date ? new Date(budget.date).toLocaleDateString('es-AR') : '',
                reference: budget.reference,
                paymentTerms: budget.paymentTerms,
                showTotal: budget.showTotal,
                currency: currencySymbol,
                grandTotal: grandTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 }),
                details: detailsWithCurrency,
                approvedBy,
                approvedAt: approvedAt.toLocaleString('es-AR'),
                portalLink: `${process.env.FRONT_URL ?? ''}/portal/budgets/${id}`,
            };

            const html = await this.emailService.compileTemplate(EmailTemplate.BUDGET_APPROVED, locals);
            const subject = `Presupuesto ${code} aprobado - Calibraciones ITM`;

            // To client
            await this.emailService.sendEmail({ html, subject, to: user.email });

            // BCC to lab if configured
            const labEmail = process.env.LAB_NOTIFICATION_EMAIL;
            if (labEmail) {
                await this.emailService.sendEmail({ html, subject, to: labEmail });
            }
        } catch (e) {
            console.error('Error sending approval email:', e);
        }

        return updated;
    }

    async getByEquipment(equipmentId: string, officeId?: string): Promise<IBadget[]> {
        const query: Record<string, any> = {
            'details.linkedEquipmentId': new Types.ObjectId(equipmentId),
        };
        if (officeId) {
            query.office = new Types.ObjectId(officeId);
        }
        return this.badgetModel
            .find(query)
            .populate({ path: 'office', populate: { path: 'client' } })
            .populate('advisor')
            .sort({ createdAt: -1 })
            .lean({ virtuals: true }) as unknown as IBadget[];
    }

    async clientReject(id: string, officeId: string, rejectionReason?: string): Promise<IBadget> {
        const budget = await this.badgetModel.findById(id).lean();
        if (!budget) throw new NotFoundException(`Presupuesto ${id} no encontrado`);
        if (budget.office?.toString() !== officeId) throw new ForbiddenException('Sin acceso a este presupuesto');
        if (budget.status !== 'PENDING') throw new BadRequestException('El presupuesto ya fue procesado');

        const update: Record<string, any> = { status: 'REJECTED' };
        if (rejectionReason) update.rejectionReason = rejectionReason;

        return this.badgetModel
            .findByIdAndUpdate(id, { $set: update }, { new: true })
            .lean({ virtuals: true }) as unknown as IBadget;
    }

}
