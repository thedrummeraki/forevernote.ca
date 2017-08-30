class NotesController < AuthenticatedController

  def save_note
    contents = params[:content]
    id = params[:note_id]
    is_chunks = params[:chunks] == "true"
    is_first = params[:is_first] == "true"
    idx = params[:i] || 0
    idx = idx.to_i
    if idx < -1
      render json: {success: false, message: "Invalid note id."}
      return
    end
      
    if idx == 0 || !is_chunks || is_first
      new_id = current_user.save_note(contents, id, true)
      success = !new_id.nil?
    elsif is_chunks
      current_user.with_lock do
        success = current_user.append_note(contents, id)
      end
    else
      success = false
    end
    render json: {success: success, new_id: new_id}
  end

  def save_note_title
    id = params[:note_id]
    title = params[:title]
    if id && title
      #begin
        #title = Base64.decode64(title)
        res = current_user.set_note_title(id, title)
        if !res
          render json: {success: false, message: "It seems this note does not exist anyone on our servers!"}
        else
          render json: {success: true, new_id: id}
        end
      #catch
      #  render json: {success: false, message: "Invalid title format. Please try a different title."}
      #end
    else
      render json: {success: false, message: "Missing title or id."}
    end
  end

  def get_note
    id = params[:note_id]
    if id
      note = current_user.get_note(id)
      if note
        res = {success: true, contents: note[:note], title: note[:title]}
      else
        res = {success: false, contents: nil}
      end
      render json: res
    else
      render json: {success: false, message: "No note was specified."}
    end
  end

  def delete_note
    id = params[:note_id]
    if id
      render json: {success: current_user.delete_note(id)}
    else
      render json: {success: false, message: "No note was specified."}
    end
  end

  def get_notes
    keyword = params[:keyword]
    is_b64 = params[:b64]
    is_uri = params[:uri]
    if keyword
      if is_b64 == "true"
        begin
          keyword = Base64.decode64(keyword)
        rescue Exception => e
          render json: {message: "Invalid base 64 keyword."}; return
        end
      end
      if is_uri == "true"
        begin
          keyword = URI.unescape keyword
        rescue Exception => e
          render json: {message: "Invalid URI escaped keyword."}; return
        end
      end
      p "keyword: #{keyword}"
      notes = current_user.find_notes keyword, {:b64 => is_b64 == "true", uri: is_uri == "true"}
    else
      notes = current_user.get_notes
    end
    render json: {notes: notes}
  end

  def download_html
    id = params[:note_id]
    if id
      note = current_user.get_note(id)
      if note
        note_text = note[:note]
        begin
          note_text = Base64.decode64(note_text)
          note_text = URI.unescape note_text
        rescue Exception => e
          p e
        end
        note_text = "<html><link href='https://cdn.quilljs.com/1.0.0/quill.snow.css' rel='stylesheet'><body><div class='ql-editor'>#{note_text}</div></body></html>"
        note_text = Nokogiri::HTML(note_text).to_s
        title = note[:title] || "Untitled-#{note[:id]}"
        send_data note_text, filename: "forevernote-#{title}.html"
      else
        render json: {success: false, url: nil}
      end
    else
      render json: {success: false, message: "No note was specified."}
    end
  end

  def download_text
    id = params[:note_id]
    if id
      note = current_user.get_note(id)
      if note
        res = {success: true}
        note_text = note[:note].gsub("<br>", "\n")
        note_text = note_text.gsub("<br/>", "\n")
        note_text = Nokogiri::HTML(note_text).text
        title = note[:title] || "Untitled-#{note[:id]}"
        send_data note_text, filename: "forevernote-#{title}.txt"
      else
        res = {success: false, url: nil}
        render json: res
      end
    else
      render json: {success: false, message: "No note was specified."}
    end
  end

  def download_pdf
    id = params[:note_id]
    if id
      note = current_user.get_note(id)
      if note
        res = PdfConvert.to_pdf(note)
        send_data res[:raw], filename: res[:filename], disposition: "inline", type: "application/pdf"
      else
        render json: {success: false, url: nil}
      end
    else
      render json: {success: false, message: "No note was specified."}
    end
  end
end
