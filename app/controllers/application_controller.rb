class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  before_filter {
    @username = params[:username]
  }

  include ApplicationHelper

  def root
    render 'login' unless logged_in?
    redirect_to '/editor' if logged_in?
  end

  def register
    render 'register' unless logged_in?
  end

  def editor
    render 'editor' if logged_in?
  end

  def check_login
    username = params[:one].strip.downcase
    password = params[:two].strip

    render json: {message: "Hey, we can't log you in if you are silent!"} if username.size == 0 && password.size == 0
    render json: {message: "You forgot your username!"} if password.size > 0 && username.size == 0
    render json: {message: "You forgot your password, #{username}!", password: true} if username.size > 0 && password.size == 0

    return if username.size == 0 || password.size == 0

    user = User.find_by(username: username.downcase)
    unless user.nil?
        if user.authenticate(password)
            log_in user
            render json: {new_url: "/", success: true}
        else
          render json: {message: "Sorry #{username}, but your password is wrong. Please try again!", password: true}
        end
    else
      render json: {message: "Sorry, but we do not know \"#{username}\"... Try again!"}
    end
  end

  def logout
    log_out
    redirect_to '/'
  end

  def do_register
    username = params[:username].strip.downcase
    password = params[:password]
    password_confirmation = params[:cpassword]
    email = params[:email].strip.downcase
    user_name = params[:name]

    errors = []
    user = User.find_by(username: username.downcase)
    unless user.nil?
        errors.push({id: "username", message: "This username is already used."})
    end

    user = User.find_by(email_address: email.downcase)
    unless user.nil?
        errors.push({id: "email", message: "This email is already used."})
    end

    unless password == password_confirmation
        errors.push({id: "password", message: "Entered passwords do not match."})
    end

    success = errors.size == 0
    if success
        user = User.new
        user.username = username
        user.password = password
        user.password_confirmation = password_confirmation
        user.email_address = email
        user.name = user_name
        user.save
    end

    url = "/?username=#{username}" if success
    render json: {success: success, url: url, errors: errors}
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
    elsif id != -1 && id.nil?
      render json: {success: false, message: "Missing note id."}
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

  def get_notes
    render json: {notes: current_user.get_notes}
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
        send_data note_text, filename: "forevernote-#{note[:id]}.txt"
      else
        res = {success: false, url: nil}
        render json: res
      end
    else
      render json: {success: false, message: "No note was specified."}
    end
  end

end
