import { LoggerService } from '../../logging/logger.service';
import * as i0 from "@angular/core";
export declare class RandomService {
    private readonly doc;
    private loggerService;
    constructor(doc: any, loggerService: LoggerService);
    createRandom(requiredLength: number): string;
    private toHex;
    private randomString;
    private getCrypto;
    static ɵfac: i0.ɵɵFactoryDef<RandomService, never>;
    static ɵprov: i0.ɵɵInjectableDef<RandomService>;
}
//# sourceMappingURL=random.service.d.ts.map