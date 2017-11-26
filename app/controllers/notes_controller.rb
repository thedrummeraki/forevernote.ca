class NotesController < AuthenticatedController

  include ChunksHelper  

  def request_id
    render json: current_user.create_note
  end

  def reject_id
    id = params[:note_id]
    unless id.nil?
        render json: {success: current_user.delete_note(id)}
    else
        render json: {success: false, message: "There is nothing to reject."}
    end
  end

  def save_chunk
    title = params[:title]
    id = params[:note_id]
    unless title
        contents = params[:chunk]
        idx = params[:pos].to_i
        quantity = params[:quantity].to_i
        if idx < -1
          render json: {success: false, message: "Invalid note index."}
          return
        end
        done = save_tmp_chunk contents, id, idx, quantity
        progress_value = (idx + 1) / quantity.to_f
        progress_value = progress_value * 100
        progress_value = progress_value.to_i
    else
        progress_value = nil
        done = save_tmp_chunk_title title, id
    end
    render json: {success: true, note_id: id, chunk: contents, tmp_chunks: tmp_chunks, progress_value: progress_value, done: done}
    #new_id = current_user.save_chunk(contents, id, idx, true)
    #render json: {success: !new_id.nil?, note_id: new_id, chunk: contents}
  end

  def patch_save_chunk
    id = params[:note_id]
  end

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
      # new_id = current_user.save_chunk(contents, id, idx, true)
      success = !new_id.nil?
    elsif is_chunks
      #current_user.with_lock do
      #  success = current_user.append_note(contents, id)
      #end
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
        res = {success: true, contents: note[:contents], title: note[:title]}
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
    
    as_chunks = params[:as_chunks]
    if as_chunks == "true"
      render json: {notes: current_user.get_notes} 
      return
    end

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
      p "search keyword: #{keyword}"
      notes = current_user.find_notes keyword, {:b64 => is_b64 == "true", uri: is_uri == "true"}
    else
      notes = current_user.get_built_notes
    end
    render json: {notes: notes}
  end

  def download_html
    id = params[:note_id]
    if id
      note = current_user.get_note(id)
      if note
        note_text = note[:contents]
        begin
          note_text = Base64.decode64(note_text)
          note_text = URI.unescape note_text
        rescue Exception => e
          p e
        end
        note[:contents] = note_text
        note_text = PdfConvert.build_html :html, note, current_user
        # note_text = Nokogiri::HTML(note_text).to_s
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
        note_text = note[:contents]
        begin
          note_text = Base64.decode64(note_text)
          note_text = URI.unescape note_text
        rescue Exception => e
          render json: {success: false, message: "Invalid b64 or html data.", expection: e.to_s}
          return
        end
        note_text = note_text.gsub("<br>", "\n")
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
      p note
      if note
        note_text = note[:contents]
        begin
          note_text = Base64.decode64(note_text)
          note_text = URI.unescape note_text
        rescue Exception => e
          p e
        end
        note[:contents] = note_text
        res = PdfConvert.to_pdf(note, current_user)
        send_data res[:raw], filename: res[:filename], disposition: "inline", type: "application/pdf"
      else
        render json: {success: false, url: nil}
      end
    else
      render json: {success: false, message: "No note was specified."}
    end
  end
end
