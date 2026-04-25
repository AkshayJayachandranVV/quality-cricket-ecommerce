import { Request, Response } from 'express';
import * as faqService from '../services/faqService';

export const getFaqs = async (_req: Request, res: Response) => {
    try {
        const faqs = await faqService.getAllFaqs();
        res.json(faqs);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const createFaq = async (req: Request, res: Response) => {
    try {
        const faq = await faqService.createFaq(req.body);
        res.status(201).json(faq);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const updateFaq = async (req: Request, res: Response) => {
    try {
        const faq = await faqService.updateFaq(Number(req.params.id), req.body);
        res.json(faq);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteFaq = async (req: Request, res: Response) => {
    try {
        await faqService.deleteFaq(Number(req.params.id));
        res.json({ message: 'FAQ deleted' });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};
