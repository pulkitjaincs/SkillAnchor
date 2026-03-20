

import type { Error as MongooseError, Types } from "mongoose";
import type { IJob } from "../models/Job.model.js";
import type { IApplication } from "../models/Application.model.js";
import type { IWorkerProfile } from "../models/WorkerProfile.model.js";


export interface JwtPayload {
    id: string;
}


export interface OtpCondition {
    email?: string;
    phone?: string;
}


export interface HttpError extends Error {
    status?: number;
    code?: number;
    path?: string;
    value?: string;
    errors?: Record<string, MongooseError.ValidatorError | MongooseError.CastError>;
}


export interface SharedProfileFields {
    avatar?: string | null;
    isAvatarHidden?: boolean;
}


export interface ProfileResponse {
    name: string;
    email?: string;
    phone?: string;
    role: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    [key: string]: unknown;
}


export type AggregatedUser = Omit<InstanceType<typeof import("../models/User.model.js").default>, "profile"> & {
    profile?: IWorkerProfile;
};


export interface PopulatedJob extends Omit<IJob, "company"> {
    _id: Types.ObjectId;
    employer: Types.ObjectId;
    company: {
        _id: Types.ObjectId;
        name: string;
        logo: string;
    };
}


export interface PopulatedJobRef {
    _id: Types.ObjectId;
    title: string;
    company?: {
        _id: Types.ObjectId;
        name: string;
    };
}


export interface PopulatedApplication extends Omit<IApplication, "job"> {
    job: PopulatedJob;
}


export interface HiredJobData {
    applicationId: string;
    employerId: string;
}
