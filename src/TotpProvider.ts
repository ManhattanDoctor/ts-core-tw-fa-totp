import { ITwoFaProvider, ITwoFaValidateDetails } from '@ts-core/two-fa-backend/provider';
import { ILogger, LoggerWrapper } from '@ts-core/common/logger';
import { TwoFaOwnerUid } from '@ts-core/two-fa';
import * as speakeasy from 'speakeasy';
import * as _ from 'lodash';

export class TotpProvider extends LoggerWrapper implements ITwoFaProvider<ITotpCreateDetails> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, protected options: ITotpOptions) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async create(ownerUid: TwoFaOwnerUid): Promise<ITotpCreateDetails> {
        let secret = speakeasy.generateSecret({ name: this.options.name, length: this.options.length }).base32;
        return { secret };
    }

    public async validate(token: string, details: ITotpCreateDetails): Promise<ITwoFaValidateDetails> {
        if (_.isEmpty(token)) {
            return { isValid: false };
        }
        token = token.replace(/[^0-9]/gi, '');
        let delta = speakeasy.totp.verifyDelta({ token, secret: details.secret, window: this.options.window, encoding: 'base32' });
        return { isValid: !_.isNil(delta) };
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get type(): string {
        return 'totp';
    }
}

export interface ITotpOptions {
    name: string;
    length: number;
    window: number;
}

export interface ITotpCreateDetails {
    secret: string;
}
