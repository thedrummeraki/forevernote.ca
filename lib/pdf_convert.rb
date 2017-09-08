class PdfConvert

    NO_MARGIN = {bottom: 0, top: 0, left: 0, right: 0}

    HTML_TEMPLATE_FOLDER = Rails.root + "html_samples/"
    HTML_TEMPLATE_01 = HTML_TEMPLATE_FOLDER + "sample_html_1.html"
    PDF_HTML_TEMPLATE_01 = HTML_TEMPLATE_FOLDER + "sample_pdf_1.html"

    BIN_LOCATION = Rails.root + "bin/wkhtmltopdf"
    PDFKit.configure do |config|
        config.wkhtmltopdf = BIN_LOCATION
    end
    WickedPdf.config = { exe_path: "#{Rails.root}/bin/wkhtmltopdf" }

    def self.html html
        result = "<html>"
        result << "<head>"
        result << "<head><meta charset='UTF-8'></html>"
        result << html
        result << "</html>"
    end

    def self.to_pdf note, current_user
        title = note[:title] || "Untitled-#{note[:id]}"
        filename = "forevernote-#{title}.pdf"
        html = self.build_html :pdf, note, current_user
        pdf = WickedPdf.new.pdf_from_string html, margin: NO_MARGIN, padding: {top: 10}
        {raw: pdf, filename: filename}
    end

    def self.build_default_html note, current_user
        self.build_html :html, note, current_user
    end

    def self.build_pdf_html node, current_user
        self.build_html :pdf, note, current_user
    end

    def self.build_html type, note, current_user
        title = note[:title] || "Untitled note"
        contents = Nokogiri::HTML::DocumentFragment.parse note[:contents]
        id = note[:id]
        date = Time.now.to_s
        username = current_user.get_name

        filename = get_filename type
        return nil if filename.nil?
        template_html = File.read filename
        template_html = Nokogiri::HTML(template_html)
        p "first"
        template_html.traverse do |elem|
            if elem.class == Nokogiri::XML::Element
                format_for = elem.attributes["format-for"]
                if format_for
                    actual_format_for = format_for.to_s
                    if actual_format_for == "title"
                        elem.content = title
                    elsif actual_format_for == "contents"
                        elem << contents
                    elsif actual_format_for == "id"
                        elem.content = id
                    elsif actual_format_for == "date"
                        elem.content = date
                    elsif actual_format_for == "username"
                        elem.content = username
                    end 
                end
            end
        end
        template_html.to_s.gsub('\n', '')
    end

    private
        def self.get_filename type
            return HTML_TEMPLATE_01 if type == :html
            return PDF_HTML_TEMPLATE_01 if type == :pdf
        end

end
