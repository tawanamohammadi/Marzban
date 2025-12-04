"""
Router for host and inbound ordering operations.
"""
from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app import xray
from app.db import Session, crud, get_db
from app.models.admin import Admin
from app.models.proxy import ProxyHost
from app.utils import responses


router = APIRouter(
    tags=["Hosts"], prefix="/api", responses={401: responses._401, 403: responses._403}
)


class InboundOrderRequest(BaseModel):
    """Request model for updating inbound order."""
    order: List[str]  # List of inbound tags in desired order


class HostOrderRequest(BaseModel):
    """Request model for updating host order within an inbound."""
    host_ids: List[int]  # List of host IDs in desired order


class InboundResponse(BaseModel):
    """Response model for inbound with sort index."""
    tag: str
    sort_index: int

    class Config:
        from_attributes = True


class HostResponse(BaseModel):
    """Response model for host with sort index."""
    id: int
    remark: str
    address: str
    port: int | None
    sort_index: int
    inbound_tag: str

    class Config:
        from_attributes = True


@router.get("/inbounds/ordered", response_model=List[InboundResponse])
def get_inbounds(
    db: Session = Depends(get_db),
    _: Admin = Depends(Admin.check_sudo_admin),
):
    """Get all inbounds ordered by sort_index."""
    return crud.get_all_inbounds(db)


@router.put("/inbounds/order", response_model=List[InboundResponse])
def update_inbounds_order(
    payload: InboundOrderRequest,
    db: Session = Depends(get_db),
    _: Admin = Depends(Admin.check_sudo_admin),
):
    """Update the order of inbounds."""
    result = crud.update_inbound_order(db, payload.order)
    xray.hosts.update()
    return result


@router.get("/hosts/{inbound_tag}", response_model=List[HostResponse])
def get_hosts_ordered(
    inbound_tag: str,
    db: Session = Depends(get_db),
    _: Admin = Depends(Admin.check_sudo_admin),
):
    """Get all hosts for an inbound ordered by sort_index."""
    return crud.get_hosts_ordered(db, inbound_tag)


@router.put("/hosts/{inbound_tag}/order", response_model=List[HostResponse])
def update_hosts_order(
    inbound_tag: str,
    payload: HostOrderRequest,
    db: Session = Depends(get_db),
    _: Admin = Depends(Admin.check_sudo_admin),
):
    """Update the order of hosts within an inbound."""
    result = crud.update_host_order(db, inbound_tag, payload.host_ids)
    xray.hosts.update()
    return result
