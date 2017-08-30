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

  def register
    if logged_in?
      redirect_to '/'
    else
      render 'register'
    end
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

  def test; end

  def test_post
    render json: {response: "This is my response."}
  end

end
