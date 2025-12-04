"""add sort_index to inbounds and hosts

Revision ID: f8a9b2c3d4e5
Revises: c3cd674b9bcd
Create Date: 2024-12-04

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f8a9b2c3d4e5'
down_revision = 'c3cd674b9bcd'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add sort_index to inbounds table
    op.add_column('inbounds', sa.Column('sort_index', sa.Integer(), nullable=False, server_default=sa.text('0')))
    
    # Add sort_index to hosts table
    op.add_column('hosts', sa.Column('sort_index', sa.Integer(), nullable=False, server_default=sa.text('0')))


def downgrade() -> None:
    op.drop_column('hosts', 'sort_index')
    op.drop_column('inbounds', 'sort_index')
