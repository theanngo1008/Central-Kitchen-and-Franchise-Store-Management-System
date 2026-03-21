import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  normalizeText,
  validateFranchiseField,
  validateFranchiseForm,
  type FranchiseFormErrors,
} from "../validators/franchiseForm.validator";

import type {
  AdminFranchise,
  CentralKitchenOption,
  CreateFranchisePayload,
  FranchiseStatus,
  UpdateFranchisePayload,
} from "@/types/admin/franchise.types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: AdminFranchise | null;
  kitchenOptions: CentralKitchenOption[];
  onCreate: (payload: CreateFranchisePayload) => void | Promise<void>;
  onUpdate: (
    id: number,
    payload: UpdateFranchisePayload,
  ) => void | Promise<void>;
};

const STATUS_OPTIONS: FranchiseStatus[] = ["ACTIVE", "INACTIVE"];

export const FranchiseUpsertModal: React.FC<Props> = ({
  open,
  onOpenChange,
  selected,
  kitchenOptions,
  onCreate,
  onUpdate,
}) => {
  const isEdit = !!selected;

  const [centralKitchenId, setCentralKitchenId] = useState<number>(0);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<FranchiseStatus>("ACTIVE");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [errors, setErrors] = useState<FranchiseFormErrors>({});

  useEffect(() => {
    if (!open) return;

    setErrors({});

    if (selected) {
      setCentralKitchenId(selected.centralKitchenId);
      setName(selected.name);
      setStatus(selected.status);
      setAddress(selected.address);
      setLocation(selected.location);
      setLatitude(selected.latitude);
      setLongitude(selected.longitude);
      return;
    }

    setCentralKitchenId(kitchenOptions[0]?.value ?? 0);
    setName("");
    setStatus("ACTIVE");
    setAddress("");
    setLocation("");
    setLatitude(0);
    setLongitude(0);
  }, [open, selected, kitchenOptions]);

  useEffect(() => {
    if (!open || selected) return;

    if (centralKitchenId === 0 && kitchenOptions.length > 0) {
      setCentralKitchenId(kitchenOptions[0].value);
    }
  }, [open, selected, kitchenOptions, centralKitchenId]);

  const noKitchenOptions = kitchenOptions.length === 0;

  const getFormData = () => ({
    centralKitchenId,
    name,
    status,
    address,
    location,
  });

  const handleFieldBlur = (field: "name" | "address" | "location") => {
    const message = validateFranchiseField(field, getFormData());
    setErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  };

  const handleKitchenChange = (value: number) => {
    setCentralKitchenId(value);

    const message = validateFranchiseField("centralKitchenId", {
      ...getFormData(),
      centralKitchenId: value,
    });

    setErrors((prev) => ({
      ...prev,
      centralKitchenId: message,
    }));
  };

  const handleStatusChange = (value: FranchiseStatus) => {
    setStatus(value);

    const message = validateFranchiseField("status", {
      ...getFormData(),
      status: value,
    });

    setErrors((prev) => ({
      ...prev,
      status: message,
    }));
  };

  const handleSubmit = async () => {
    const formData = getFormData();
    const nextErrors = validateFranchiseForm(formData);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const payload: CreateFranchisePayload | UpdateFranchisePayload = {
      centralKitchenId,
      name: normalizeText(name),
      type: "STORE",
      status,
      address: normalizeText(address),
      location: normalizeText(location),
      latitude: selected?.latitude ?? 0,
      longitude: selected?.longitude ?? 0,
    };

    if (selected) {
      await onUpdate(selected.franchiseId, payload);
      return;
    }

    await onCreate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa Cửa hàng" : "Thêm Cửa hàng"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Bếp trung tâm</Label>
            <Select
              value={
                centralKitchenId > 0 ? String(centralKitchenId) : undefined
              }
              onValueChange={(v) => handleKitchenChange(Number(v))}
              disabled={noKitchenOptions}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn bếp trung tâm" />
              </SelectTrigger>
              <SelectContent>
                {kitchenOptions.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.centralKitchenId && (
              <p className="mt-1 text-xs text-destructive">
                {errors.centralKitchenId}
              </p>
            )}

            {noKitchenOptions && (
              <p className="mt-1 text-xs text-destructive">
                Chưa có dữ liệu bếp trung tâm để gán cho cửa hàng.
              </p>
            )}
          </div>

          <div>
            <Label>Loại</Label>
            <Input value="STORE" disabled />
          </div>

          <div>
            <Label>Tên cửa hàng</Label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              onBlur={() => handleFieldBlur("name")}
              placeholder="VD: Franchise Store - District 1"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div>
            <Label>Trạng thái</Label>
            <Select
              value={status}
              onValueChange={(v) => handleStatusChange(v as FranchiseStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="mt-1 text-xs text-destructive">{errors.status}</p>
            )}
          </div>

          <div>
            <Label>Địa chỉ</Label>
            <Input
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (errors.address) {
                  setErrors((prev) => ({ ...prev, address: undefined }));
                }
              }}
              onBlur={() => handleFieldBlur("address")}
              placeholder="123 Nguyễn Huệ, Q1, TP.HCM"
            />
            {errors.address && (
              <p className="mt-1 text-xs text-destructive">{errors.address}</p>
            )}
          </div>

          <div>
            <Label>Khu vực</Label>
            <Input
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (errors.location) {
                  setErrors((prev) => ({ ...prev, location: undefined }));
                }
              }}
              onBlur={() => handleFieldBlur("location")}
              placeholder="TP.HCM"
            />
            {errors.location && (
              <p className="mt-1 text-xs text-destructive">
                {errors.location}
              </p>
            )}
          </div>

          {/* <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Vĩ độ (latitude)</Label>
              <Input
                type="number"
                value={latitude}
                onChange={(e) =>
                  setLatitude(
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
              />
            </div>

            <div>
              <Label>Kinh độ (longitude)</Label>
              <Input
                type="number"
                value={longitude}
                onChange={(e) =>
                  setLongitude(
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
              />
            </div>
          </div> */}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={noKitchenOptions}
            >
              {isEdit ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};