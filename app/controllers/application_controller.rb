class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  
  include ApplicationHelper

  before_action {
    @username = params[:username]
  }

  def root
    render 'login' unless logged_in?
    redirect_to '/editor' if logged_in?
  end

  def password_reset
    if logged_in?
      redirect_to '/'
    else
      render 'password_reset'
    end
  end

  def password_reset_step_1
    user = User.find_by(email_address: params[:email_address])
    exists = !user.nil?
    if exists
      exists = user.gen_recovery_hash
    end
    email = user.email_address unless user.nil?
    render :json => {success: exists, email_address: email}
  end

  def password_reset_step_2
    user = User.find_by(email_address: params[:email_address])
    code = params[:hash_code]
    valid = !user.nil?
    if valid
      valid = user.compare_code code
    end
    render :json => {success: valid, email_address: user.email_address}
  end

  def password_reset_step_3
    user = User.find_by(email_address: params[:email_address])
    password = params[:password]
    password_confirmation = params[:password_confirmation]
    valid = !user.nil?
    if valid && password_confirmation == password
      valid = user.update_attributes password: password, password_confirmation: password_confirmation
    end
    render :json => {success: valid}
  end

  def register
    if logged_in?
      redirect_to '/'
    else
      render 'register'
    end
  end

  def check_login
    username = params[:one] || params[:username] || params[:email_address]
    password = params[:two] || params[:password]

    username = username.strip.downcase

    render json: {message: "Hey, we can't log you in if you are silent!"} if username.size == 0 && password.size == 0
    render json: {message: "You forgot your username!"} if password.size > 0 && username.size == 0
    render json: {message: "You forgot your password, #{username}!", password: true} if username.size > 0 && password.size == 0

    return if username.size == 0 || password.size == 0

    user = User.find_by(username: username.downcase)
    if user.nil?
      user = User.find_by(email_address: username.downcase)
    end
    unless user.nil?
        if user.authenticate(password)
            unless user.is_activated?
              render json: {message: "We are sorry, but your account is not yet activated. Please do so by checking your email address."}
            else
              log_in user
              render json: {new_url: "/", success: true}
            end
        else
            render json: {message: "Sorry #{username}, but your password is wrong. Please try again!", password: true}
        end
    else
        render json: {message: "Sorry, but we do not know \"#{username}\"... Try again!"}
    end
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
        success = user.register
    end

    url = "/registered?username=#{username}" if success
    render json: {success: success, url: url, errors: errors}
  end

  def registered
    @user_email = User.find_by username: params[:username]
    redirect_to '/' unless @user_email
    @username = @user_email.username
    @user_email = @user_email.email_address
  end

  def activate
    user = User.find_by registration_hash: params[:hash]
    if user
      p "Found username #{user.username}"
      @hash = user.registration_hash
    else
      @hash = nil
    end
  end

  def finalize_activation
    p "Finalizing activation"
    rhash = params[:hash]
    user = User.find_by registration_hash: rhash
    if user
      p "Setting activated #{user.is_activated?}"
      user.set_activated
      url = '/success'
    else
      url = '/errors?message=This username ' + params[:username] + ' was not found!'
    end
    render json: {url: url}
  end

  def test; end
  def test_json; render json: {response: "This is my GET response."}; end

  def test_post
    render json: {response: "This is my POST response."}
  end

end
