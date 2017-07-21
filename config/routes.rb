Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'application#root'
  post '/login' => 'application#check_login'
  get '/logout' => 'application#logout'

  get '/register' => 'application#register'
  post '/register' => 'application#do_register'

  get '/editor' => 'application#editor'
  get '/get/note' => 'application#get_note'
  post '/save/note' => 'application#save_note'
end
