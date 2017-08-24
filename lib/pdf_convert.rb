class PdfConvert

    BIN_LOCATION = Rails.root + "bin/wkhtmltopdf"
    PDFKit.configure do |config|
        config.wkhtmltopdf = BIN_LOCATION
    end
    WickedPdf.config = { exe_path: "#{Rails.root}/bin/wkhtmltopdf" }

    def self.to_pdf(note)
        p note
        title = note[:title] || "Untitled-#{note[:id]}"
        html = note[:note]
        begin
          html = Base64.decode64(html)
          html = URI.unescape html
        rescue Exception => e
          p e
        end
        filename = "forevernote-#{title}.pdf"
        pdf = WickedPdf.new.pdf_from_string html
        {raw: pdf, filename: filename}
    end

end
