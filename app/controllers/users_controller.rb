class UsersController < AuthenticatedController

  def user_update
    user_id = params[:user_id]
    if user_id.to_s.strip.empty?
      p "Saving user data failed: missing param user_id."
      render json: {success: false, message: "Missing user id."};
      return
    end
    username = params[:username].strip.downcase
    password = params[:password]
    password_confirmation = params[:cpassword]
    email = params[:email].strip.downcase
    user_name = params[:name]

    errors = []
    user = User.find_by(username: username.downcase)
    unless user.nil? || current_user.username == username.downcase
        errors.push({id: "username", message: "This username is already used."})
    end

    user = User.find_by(email_address: email.downcase)
    unless user.nil? || current_user.email_address == email.downcase
        errors.push({id: "email", message: "This email is already used."})
    end

    if password.to_s.strip.size > 0
      unless password == password_confirmation
          errors.push({id: "password", message: "Entered passwords do not match."})
      end
    end

    success = errors.size == 0
    if success
        user = User.find_by(id: user_id)
        if user.nil?
          p "Saving user data failed: invalid user id: #{user_id}. User does not exist."
          render json: {success: false, message: "Sorry. We are afraid this account does not exist or was removed from our servers."};
        end
        user.username = username
        user.password = password
        user.password_confirmation = password_confirmation
        user.email_address = email
        user.name = user_name
        user.save
    end

    render json: {success: success, errors: errors}
  end

  def logout
    log_out
    redirect_to '/'
  end
  
end
