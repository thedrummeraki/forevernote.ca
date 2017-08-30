class AuthenticatedController < ApplicationController

    before_action {
        unless logged_in?
            redirect_to '/'
        end
    }

    def get_current_user_id
        render json: {id: current_user.id}
    end

    def get_current_user_name
        render json: {user_name: current_user.get_name}
    end

    def editor
        render 'editor' if logged_in?
    end

end
