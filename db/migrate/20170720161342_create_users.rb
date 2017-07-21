class CreateUsers < ActiveRecord::Migration[5.0]
  def change
    create_table :users do |t|
      t.string :username
      t.string :password
      t.string :password_confirmation
      t.string :name
      t.string :email_address
      t.string :picture_raw
      t.string :settings
      t.string :notes
      t.string :courses
      t.boolean :accepted_rules

      t.timestamps
    end
  end
end
