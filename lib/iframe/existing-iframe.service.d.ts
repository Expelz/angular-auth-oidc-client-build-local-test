import { LoggerService } from '../logging/logger.service';
import * as i0 from "@angular/core";
export declare class IFrameService {
    private readonly doc;
    private loggerService;
    constructor(doc: any, loggerService: LoggerService);
    getExistingIFrame(identifier: string): HTMLIFrameElement | null;
    addIFrameToWindowBody(identifier: string): HTMLIFrameElement;
    private getIFrameFromParentWindow;
    private getIFrameFromWindow;
    private isIFrameElement;
    static ɵfac: i0.ɵɵFactoryDef<IFrameService, never>;
    static ɵprov: i0.ɵɵInjectableDef<IFrameService>;
}
//# sourceMappingURL=existing-iframe.service.d.ts.map