class AddRecoveryHashToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :recovery_hash, :string
  end
end
