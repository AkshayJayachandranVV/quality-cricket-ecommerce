import db from '../models';

export const getAllFaqs = async () => {
    return await db.FAQ.findAll({
        order: [['category', 'ASC'], ['id', 'ASC']]
    });
};

export const createFaq = async (data: { question: string, answer: string, category: string }) => {
    return await db.FAQ.create(data);
};

export const updateFaq = async (id: number, data: any) => {
    const faq = await db.FAQ.findByPk(id);
    if (!faq) throw new Error('FAQ not found');
    return await faq.update(data);
};

export const deleteFaq = async (id: number) => {
    const faq = await db.FAQ.findByPk(id);
    if (!faq) throw new Error('FAQ not found');
    return await faq.destroy();
};
