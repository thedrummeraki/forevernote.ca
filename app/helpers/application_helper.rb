module ApplicationHelper

    def current_user
        @current_user ||= User.find_by(id: session[:user_id])
    end

    def logged_in?
        !current_user.nil? && current_user.is_activated?
    end

    def log_in(user)
        session[:user_id] = user.id
        session[:user_login_time] = Time.now
    end

    def log_out
        _logout if logged_in?
    end

    private
        def _logout
            session.delete(:user_id)
        end

end
