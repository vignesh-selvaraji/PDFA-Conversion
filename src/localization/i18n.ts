import { createI18n } from 'vue-i18n'

export default createI18n({
    locale: 'en-US',
    allowComposition: true, // you need to specify that!
    messages: {
        'en-US': {
            TitleStr: "PDF to PdfA conversion",
            inputStr: 'Input :',
            browseStr: 'Browse...',
            PDFAStr: 'PDF/A :',
            convertStr: 'Convert',
        },
    }
})
