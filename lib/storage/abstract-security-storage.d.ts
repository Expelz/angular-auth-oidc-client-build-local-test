import * as i0 from "@angular/core";
/**
 * Implement this class-interface to create a custom storage.
 */
export declare abstract class AbstractSecurityStorage {
    /**
     * This method must contain the logic to read the storage.
     *
     * @return The value of the given key
     */
    abstract read(key: string): any;
    /**
     * This method must contain the logic to write the storage.
     *
     * @param value The value for the given key
     */
    abstract write(key: string, value: any): void;
    /**
     * This method must contain the logic to remove an item from the storage.
     *
     * @param key The value for the key to be removed
     */
    abstract remove(key: string): void;
    static ɵfac: i0.ɵɵFactoryDef<AbstractSecurityStorage, never>;
    static ɵprov: i0.ɵɵInjectableDef<AbstractSecurityStorage>;
}
//# sourceMappingURL=abstract-security-storage.d.ts.map