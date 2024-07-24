import Task from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';
import Auth from "../auth/Auth";
import XHRInterface from "../utils/XHRInterface";
import TaskBaseProcess, {ProcessParams, TaskBaseProcessProcess} from "./TaskBaseProcess";

export type OcrLanguage =
    'eng' |
    'afr' |
    'amh' |
    'ara' |
    'asm' |
    'aze' |
    'aze_cyrl' |
    'bel' |
    'ben' |
    'bod' |
    'bos' |
    'bre' |
    'bul' |
    'cat' |
    'ceb' |
    'ces' |
    'chi_sim' |
    'chi_tra' |
    'chr' |
    'cos' |
    'cym' |
    'dan' |
    'deu' |
    'deu_latf' |
    'dzo' |
    'ell' |
    'enm' |
    'epo' |
    'equ' |
    'est' |
    'eus' |
    'fao' |
    'fas' |
    'fil' |
    'fin' |
    'fra' |
    'frm' |
    'fry' |
    'gla' |
    'gle' |
    'glg' |
    'grc' |
    'guj' |
    'hat' |
    'heb' |
    'hin' |
    'hrv' |
    'hun' |
    'hye' |
    'iku' |
    'ind' |
    'isl' |
    'ita' |
    'ita_old' |
    'jav' |
    'jpn' |
    'kan' |
    'kat' |
    'kat_old' |
    'kaz' |
    'khm' |
    'kir' |
    'kmr' |
    'kor' |
    'kor_vert' |
    'lao' |
    'lat' |
    'lav' |
    'lit' |
    'ltz' |
    'mal' |
    'mar' |
    'mkd' |
    'mlt' |
    'mon' |
    'mri' |
    'msa' |
    'mya' |
    'nep' |
    'nld' |
    'nor' |
    'oci' |
    'ori' |
    'pan' |
    'pol' |
    'por' |
    'pus' |
    'que' |
    'ron' |
    'rus' |
    'san' |
    'sin' |
    'slk' |
    'slv' |
    'snd' |
    'spa' |
    'spa_old' |
    'sqi' |
    'srp' |
    'srp_latn' |
    'sun' |
    'swa' |
    'swe' |
    'syr' |
    'tam' |
    'tat' |
    'tel' |
    'tgk' |
    'tgl' |
    'tha' |
    'tir' |
    'ton' |
    'tur' |
    'uig' |
    'ukr' |
    'urd' |
    'uzb' |
    'uzb_cyrl' |
    'vie' |
    'yid' |
    'yor'


export interface PdfOcrParams extends ProcessParams {
    ocr_languages?: [OcrLanguage, ...OcrLanguage[]]; // non-empty array
}

export default class PdfOcrTask extends TaskBaseProcess {
    public type: ILovePDFTool;

    constructor(auth: Auth, xhr: XHRInterface , params: TaskParams = {}) {
        super(auth, xhr, params);

        this.type = 'pdfocr';
    }

    async process(params: PdfOcrParams = {}): Promise<TaskBaseProcessProcess> {
        const paramsWithDefaultLang: PdfOcrParams = {ocr_languages: ['eng'], ...params}
        return super.process(paramsWithDefaultLang);
    }

}
