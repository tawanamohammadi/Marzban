import {
    Box,
    Button,
    Collapse,
    Divider,
    FormControl,
    FormLabel,
    HStack,
    IconButton,
    Input,
    NumberInput,
    NumberInputField,
    Select,
    Switch,
    Text,
    Textarea,
    Tooltip,
    VStack,
    useColorModeValue,
    useDisclosure,
    chakra,
} from "@chakra-ui/react";
import {
    ChevronDownIcon,
    ChevronUpIcon,
    PlusIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import { FC, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const DeleteIcon = chakra(TrashIcon, {
    baseStyle: { w: 4, h: 4 },
});

const AddIcon = chakra(PlusIcon, {
    baseStyle: { w: 4, h: 4 },
});

// Protocol types and their default ports
const PROTOCOLS = [
    { value: "vmess", label: "VMess", defaultPort: 443 },
    { value: "vless", label: "VLESS", defaultPort: 443 },
    { value: "trojan", label: "Trojan", defaultPort: 443 },
    { value: "shadowsocks", label: "Shadowsocks", defaultPort: 8388 },
];

// Transport types
const TRANSPORTS = [
    { value: "tcp", label: "TCP" },
    { value: "ws", label: "WebSocket" },
    { value: "grpc", label: "gRPC" },
    { value: "http", label: "HTTP/2" },
    { value: "quic", label: "QUIC" },
    { value: "kcp", label: "mKCP" },
    { value: "httpupgrade", label: "HTTP Upgrade" },
    { value: "splithttp", label: "SplitHTTP" },
];

// Security types
const SECURITIES = [
    { value: "none", label: "None" },
    { value: "tls", label: "TLS" },
    { value: "reality", label: "Reality" },
];

// TLS ALPN options
const ALPN_OPTIONS = [
    { value: "h2", label: "h2" },
    { value: "http/1.1", label: "http/1.1" },
    { value: "h2,http/1.1", label: "h2,http/1.1" },
];

// Shadowsocks methods
const SS_METHODS = [
    { value: "chacha20-ietf-poly1305", label: "chacha20-ietf-poly1305" },
    { value: "aes-256-gcm", label: "aes-256-gcm" },
    { value: "aes-128-gcm", label: "aes-128-gcm" },
    { value: "2022-blake3-aes-128-gcm", label: "2022-blake3-aes-128-gcm" },
    { value: "2022-blake3-aes-256-gcm", label: "2022-blake3-aes-256-gcm" },
    { value: "2022-blake3-chacha20-poly1305", label: "2022-blake3-chacha20-poly1305" },
];

// TCP header types
const TCP_HEADER_TYPES = [
    { value: "none", label: "None" },
    { value: "http", label: "HTTP" },
];

export interface InboundConfig {
    tag: string;
    protocol: string;
    port: number;
    listen: string;
    settings: {
        clients?: any[];
        method?: string;
        password?: string;
        network?: string;
        decryption?: string;
    };
    streamSettings: {
        network: string;
        security: string;
        tlsSettings?: {
            serverName?: string;
            alpn?: string[];
            certificates?: {
                certificateFile?: string;
                keyFile?: string;
            }[];
        };
        realitySettings?: {
            show?: boolean;
            dest?: string;
            serverNames?: string[];
            privateKey?: string;
            publicKey?: string;
            shortIds?: string[];
        };
        wsSettings?: {
            path?: string;
            host?: string;
        };
        grpcSettings?: {
            serviceName?: string;
            multiMode?: boolean;
        };
        tcpSettings?: {
            header?: {
                type?: string;
                request?: {
                    path?: string[];
                    headers?: {
                        Host?: string[];
                    };
                };
            };
        };
        httpSettings?: {
            path?: string;
            host?: string[];
        };
    };
    sniffing?: {
        enabled: boolean;
        destOverride: string[];
    };
}

interface InboundBuilderProps {
    onAdd: (inbound: InboundConfig) => void;
    existingTags?: string[];
}

interface InboundCardProps {
    inbound: InboundConfig;
    onDelete: () => void;
    onEdit: (inbound: InboundConfig) => void;
}

// Default inbound template
const getDefaultInbound = (): InboundConfig => ({
    tag: "",
    protocol: "vless",
    port: 443,
    listen: "0.0.0.0",
    settings: {
        clients: [],
        decryption: "none",
    },
    streamSettings: {
        network: "tcp",
        security: "none",
    },
    sniffing: {
        enabled: true,
        destOverride: ["http", "tls"],
    },
});

// Inbound Card Component
export const InboundCard: FC<InboundCardProps> = ({ inbound, onDelete, onEdit }) => {
    const { isOpen, onToggle } = useDisclosure();
    const bgColor = useColorModeValue("white", "gray.700");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const { t } = useTranslation();

    const securityBadge = inbound.streamSettings?.security || "none";
    const networkBadge = inbound.streamSettings?.network || "tcp";

    return (
        <Box
            bg={bgColor}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="md"
            p={3}
            w="full"
        >
            <HStack justify="space-between">
                <HStack>
                    <Text fontWeight="bold">{inbound.tag || "Unnamed"}</Text>
                    <Text
                        fontSize="xs"
                        px={2}
                        py={0.5}
                        bg="blue.500"
                        color="white"
                        borderRadius="md"
                    >
                        {inbound.protocol.toUpperCase()}
                    </Text>
                    <Text
                        fontSize="xs"
                        px={2}
                        py={0.5}
                        bg="green.500"
                        color="white"
                        borderRadius="md"
                    >
                        {networkBadge.toUpperCase()}
                    </Text>
                    {securityBadge !== "none" && (
                        <Text
                            fontSize="xs"
                            px={2}
                            py={0.5}
                            bg="purple.500"
                            color="white"
                            borderRadius="md"
                        >
                            {securityBadge.toUpperCase()}
                        </Text>
                    )}
                    <Text fontSize="sm" color="gray.500">
                        :{inbound.port}
                    </Text>
                </HStack>
                <HStack>
                    <IconButton
                        aria-label="Toggle details"
                        icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={onToggle}
                    />
                    <Tooltip label={t("delete")}>
                        <IconButton
                            aria-label="Delete"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={onDelete}
                        />
                    </Tooltip>
                </HStack>
            </HStack>
            <Collapse in={isOpen}>
                <Box mt={3} p={2} bg={useColorModeValue("gray.50", "gray.800")} borderRadius="md">
                    <Text fontSize="xs" fontFamily="mono" whiteSpace="pre-wrap">
                        {JSON.stringify(inbound, null, 2)}
                    </Text>
                </Box>
            </Collapse>
        </Box>
    );
};

// Main Inbound Builder Component
export const InboundBuilder: FC<InboundBuilderProps> = ({ onAdd, existingTags = [] }) => {
    const [inbound, setInbound] = useState<InboundConfig>(getDefaultInbound());
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { t } = useTranslation();
    const bgColor = useColorModeValue("gray.50", "gray.800");
    const inputBgColor = useColorModeValue("white", "gray.700");

    // Update field helper
    const updateField = (path: string, value: any) => {
        setInbound((prev) => {
            const newInbound = { ...prev };
            const keys = path.split(".");
            let current: any = newInbound;

            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;

            return newInbound;
        });
    };

    // Handle protocol change
    const handleProtocolChange = (protocol: string) => {
        const protocolInfo = PROTOCOLS.find((p) => p.value === protocol);
        setInbound((prev) => ({
            ...prev,
            protocol,
            port: protocolInfo?.defaultPort || prev.port,
            settings: protocol === "shadowsocks"
                ? { method: "chacha20-ietf-poly1305", password: "", network: "tcp,udp" }
                : { clients: [], decryption: protocol === "vless" ? "none" : undefined },
        }));
    };

    // Handle security change
    const handleSecurityChange = (security: string) => {
        const newStreamSettings: InboundConfig["streamSettings"] = {
            ...inbound.streamSettings,
            security,
        };

        // Clear previous security settings
        delete newStreamSettings.tlsSettings;
        delete newStreamSettings.realitySettings;

        // Add appropriate security settings
        if (security === "tls") {
            newStreamSettings.tlsSettings = {
                serverName: "",
                alpn: ["h2", "http/1.1"],
                certificates: [{ certificateFile: "", keyFile: "" }],
            };
        } else if (security === "reality") {
            newStreamSettings.realitySettings = {
                show: false,
                dest: "www.google.com:443",
                serverNames: ["www.google.com"],
                privateKey: "",
                publicKey: "",
                shortIds: [""],
            };
        }

        setInbound((prev) => ({
            ...prev,
            streamSettings: newStreamSettings,
        }));
    };

    // Handle network/transport change
    const handleNetworkChange = (network: string) => {
        const newStreamSettings: InboundConfig["streamSettings"] = {
            network,
            security: inbound.streamSettings.security,
        };

        // Preserve security settings
        if (inbound.streamSettings.tlsSettings) {
            newStreamSettings.tlsSettings = inbound.streamSettings.tlsSettings;
        }
        if (inbound.streamSettings.realitySettings) {
            newStreamSettings.realitySettings = inbound.streamSettings.realitySettings;
        }

        // Add network-specific settings
        switch (network) {
            case "ws":
                newStreamSettings.wsSettings = { path: "/", host: "" };
                break;
            case "grpc":
                newStreamSettings.grpcSettings = { serviceName: "", multiMode: false };
                break;
            case "tcp":
                newStreamSettings.tcpSettings = {
                    header: { type: "none" },
                };
                break;
            case "http":
                newStreamSettings.httpSettings = { path: "/", host: [] };
                break;
        }

        setInbound((prev) => ({
            ...prev,
            streamSettings: newStreamSettings,
        }));
    };

    // Validate form
    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!inbound.tag) {
            newErrors.tag = t("inboundBuilder.tagRequired") || "Tag is required";
        } else if (existingTags.includes(inbound.tag)) {
            newErrors.tag = t("inboundBuilder.tagExists") || "Tag already exists";
        }

        if (!inbound.port || inbound.port < 1 || inbound.port > 65535) {
            newErrors.port = t("inboundBuilder.invalidPort") || "Invalid port";
        }

        if (inbound.streamSettings.security === "reality") {
            const reality = inbound.streamSettings.realitySettings;
            if (!reality?.privateKey) {
                newErrors.privateKey = t("inboundBuilder.privateKeyRequired") || "Private key is required";
            }
            if (!reality?.shortIds?.length || !reality.shortIds[0]) {
                newErrors.shortIds = t("inboundBuilder.shortIdRequired") || "At least one short ID is required";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle submit
    const handleSubmit = () => {
        if (validate()) {
            onAdd(inbound);
            setInbound(getDefaultInbound());
        }
    };

    // Reset form
    const handleReset = () => {
        setInbound(getDefaultInbound());
        setErrors({});
    };

    return (
        <Box bg={bgColor} p={4} borderRadius="md" w="full">
            <VStack spacing={4} align="stretch">
                <Text fontWeight="bold" fontSize="lg">
                    {t("inboundBuilder.title") || "Add New Inbound"}
                </Text>

                {/* Basic Settings */}
                <HStack spacing={4}>
                    <FormControl flex={2} isInvalid={!!errors.tag}>
                        <FormLabel fontSize="sm">{t("inboundBuilder.tag") || "Tag"}</FormLabel>
                        <Input
                            size="sm"
                            bg={inputBgColor}
                            value={inbound.tag}
                            onChange={(e) => updateField("tag", e.target.value)}
                            placeholder="e.g., VLESS-WS-TLS"
                        />
                        {errors.tag && <Text color="red.500" fontSize="xs">{errors.tag}</Text>}
                    </FormControl>

                    <FormControl flex={1}>
                        <FormLabel fontSize="sm">{t("inboundBuilder.protocol") || "Protocol"}</FormLabel>
                        <Select
                            size="sm"
                            bg={inputBgColor}
                            value={inbound.protocol}
                            onChange={(e) => handleProtocolChange(e.target.value)}
                        >
                            {PROTOCOLS.map((p) => (
                                <option key={p.value} value={p.value}>
                                    {p.label}
                                </option>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl flex={1} isInvalid={!!errors.port}>
                        <FormLabel fontSize="sm">{t("inboundBuilder.port") || "Port"}</FormLabel>
                        <NumberInput
                            size="sm"
                            min={1}
                            max={65535}
                            value={inbound.port}
                            onChange={(_, val) => updateField("port", val)}
                        >
                            <NumberInputField bg={inputBgColor} />
                        </NumberInput>
                    </FormControl>
                </HStack>

                <Divider />

                {/* Transport Settings */}
                <HStack spacing={4}>
                    <FormControl flex={1}>
                        <FormLabel fontSize="sm">{t("inboundBuilder.transport") || "Transport"}</FormLabel>
                        <Select
                            size="sm"
                            bg={inputBgColor}
                            value={inbound.streamSettings.network}
                            onChange={(e) => handleNetworkChange(e.target.value)}
                        >
                            {TRANSPORTS.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl flex={1}>
                        <FormLabel fontSize="sm">{t("inboundBuilder.security") || "Security"}</FormLabel>
                        <Select
                            size="sm"
                            bg={inputBgColor}
                            value={inbound.streamSettings.security}
                            onChange={(e) => handleSecurityChange(e.target.value)}
                        >
                            {SECURITIES.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </Select>
                    </FormControl>
                </HStack>

                {/* WebSocket Settings */}
                {inbound.streamSettings.network === "ws" && (
                    <HStack spacing={4}>
                        <FormControl flex={1}>
                            <FormLabel fontSize="sm">{t("inboundBuilder.path") || "Path"}</FormLabel>
                            <Input
                                size="sm"
                                bg={inputBgColor}
                                value={inbound.streamSettings.wsSettings?.path || ""}
                                onChange={(e) => updateField("streamSettings.wsSettings.path", e.target.value)}
                                placeholder="/"
                            />
                        </FormControl>
                        <FormControl flex={1}>
                            <FormLabel fontSize="sm">{t("inboundBuilder.host") || "Host"}</FormLabel>
                            <Input
                                size="sm"
                                bg={inputBgColor}
                                value={inbound.streamSettings.wsSettings?.host || ""}
                                onChange={(e) => updateField("streamSettings.wsSettings.host", e.target.value)}
                                placeholder="example.com"
                            />
                        </FormControl>
                    </HStack>
                )}

                {/* gRPC Settings */}
                {inbound.streamSettings.network === "grpc" && (
                    <HStack spacing={4}>
                        <FormControl flex={2}>
                            <FormLabel fontSize="sm">{t("inboundBuilder.serviceName") || "Service Name"}</FormLabel>
                            <Input
                                size="sm"
                                bg={inputBgColor}
                                value={inbound.streamSettings.grpcSettings?.serviceName || ""}
                                onChange={(e) => updateField("streamSettings.grpcSettings.serviceName", e.target.value)}
                                placeholder="grpc"
                            />
                        </FormControl>
                        <FormControl flex={1}>
                            <FormLabel fontSize="sm">{t("inboundBuilder.multiMode") || "Multi Mode"}</FormLabel>
                            <Switch
                                isChecked={inbound.streamSettings.grpcSettings?.multiMode || false}
                                onChange={(e) => updateField("streamSettings.grpcSettings.multiMode", e.target.checked)}
                            />
                        </FormControl>
                    </HStack>
                )}

                {/* TLS Settings */}
                {inbound.streamSettings.security === "tls" && (
                    <VStack spacing={3} align="stretch">
                        <Text fontWeight="semibold" fontSize="sm">TLS Settings</Text>
                        <HStack spacing={4}>
                            <FormControl flex={1}>
                                <FormLabel fontSize="sm">{t("inboundBuilder.serverName") || "Server Name (SNI)"}</FormLabel>
                                <Input
                                    size="sm"
                                    bg={inputBgColor}
                                    value={inbound.streamSettings.tlsSettings?.serverName || ""}
                                    onChange={(e) => updateField("streamSettings.tlsSettings.serverName", e.target.value)}
                                    placeholder="example.com"
                                />
                            </FormControl>
                            <FormControl flex={1}>
                                <FormLabel fontSize="sm">{t("inboundBuilder.alpn") || "ALPN"}</FormLabel>
                                <Select
                                    size="sm"
                                    bg={inputBgColor}
                                    value={inbound.streamSettings.tlsSettings?.alpn?.join(",") || "h2,http/1.1"}
                                    onChange={(e) => updateField("streamSettings.tlsSettings.alpn", e.target.value.split(","))}
                                >
                                    {ALPN_OPTIONS.map((a) => (
                                        <option key={a.value} value={a.value}>
                                            {a.label}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                        </HStack>
                        <HStack spacing={4}>
                            <FormControl flex={1}>
                                <FormLabel fontSize="sm">{t("inboundBuilder.certFile") || "Certificate File"}</FormLabel>
                                <Input
                                    size="sm"
                                    bg={inputBgColor}
                                    value={inbound.streamSettings.tlsSettings?.certificates?.[0]?.certificateFile || ""}
                                    onChange={(e) => updateField("streamSettings.tlsSettings.certificates.0.certificateFile", e.target.value)}
                                    placeholder="/path/to/cert.pem"
                                />
                            </FormControl>
                            <FormControl flex={1}>
                                <FormLabel fontSize="sm">{t("inboundBuilder.keyFile") || "Key File"}</FormLabel>
                                <Input
                                    size="sm"
                                    bg={inputBgColor}
                                    value={inbound.streamSettings.tlsSettings?.certificates?.[0]?.keyFile || ""}
                                    onChange={(e) => updateField("streamSettings.tlsSettings.certificates.0.keyFile", e.target.value)}
                                    placeholder="/path/to/key.pem"
                                />
                            </FormControl>
                        </HStack>
                    </VStack>
                )}

                {/* Reality Settings */}
                {inbound.streamSettings.security === "reality" && (
                    <VStack spacing={3} align="stretch">
                        <Text fontWeight="semibold" fontSize="sm">Reality Settings</Text>
                        <HStack spacing={4}>
                            <FormControl flex={1}>
                                <FormLabel fontSize="sm">{t("inboundBuilder.dest") || "Destination"}</FormLabel>
                                <Input
                                    size="sm"
                                    bg={inputBgColor}
                                    value={inbound.streamSettings.realitySettings?.dest || ""}
                                    onChange={(e) => updateField("streamSettings.realitySettings.dest", e.target.value)}
                                    placeholder="www.google.com:443"
                                />
                            </FormControl>
                            <FormControl flex={1}>
                                <FormLabel fontSize="sm">{t("inboundBuilder.serverNames") || "Server Names"}</FormLabel>
                                <Input
                                    size="sm"
                                    bg={inputBgColor}
                                    value={inbound.streamSettings.realitySettings?.serverNames?.join(",") || ""}
                                    onChange={(e) => updateField("streamSettings.realitySettings.serverNames", e.target.value.split(",").map(s => s.trim()))}
                                    placeholder="www.google.com"
                                />
                            </FormControl>
                        </HStack>
                        <HStack spacing={4}>
                            <FormControl flex={1} isInvalid={!!errors.privateKey}>
                                <FormLabel fontSize="sm">{t("inboundBuilder.privateKey") || "Private Key"}</FormLabel>
                                <Input
                                    size="sm"
                                    bg={inputBgColor}
                                    value={inbound.streamSettings.realitySettings?.privateKey || ""}
                                    onChange={(e) => updateField("streamSettings.realitySettings.privateKey", e.target.value)}
                                    placeholder="x25519 private key"
                                />
                                {errors.privateKey && <Text color="red.500" fontSize="xs">{errors.privateKey}</Text>}
                            </FormControl>
                            <FormControl flex={1}>
                                <FormLabel fontSize="sm">{t("inboundBuilder.publicKey") || "Public Key"}</FormLabel>
                                <Input
                                    size="sm"
                                    bg={inputBgColor}
                                    value={inbound.streamSettings.realitySettings?.publicKey || ""}
                                    onChange={(e) => updateField("streamSettings.realitySettings.publicKey", e.target.value)}
                                    placeholder="x25519 public key"
                                />
                            </FormControl>
                        </HStack>
                        <FormControl isInvalid={!!errors.shortIds}>
                            <FormLabel fontSize="sm">{t("inboundBuilder.shortIds") || "Short IDs (comma separated)"}</FormLabel>
                            <Input
                                size="sm"
                                bg={inputBgColor}
                                value={inbound.streamSettings.realitySettings?.shortIds?.join(",") || ""}
                                onChange={(e) => updateField("streamSettings.realitySettings.shortIds", e.target.value.split(",").map(s => s.trim()))}
                                placeholder="abc123,def456"
                            />
                            {errors.shortIds && <Text color="red.500" fontSize="xs">{errors.shortIds}</Text>}
                        </FormControl>
                    </VStack>
                )}

                {/* Shadowsocks Settings */}
                {inbound.protocol === "shadowsocks" && (
                    <HStack spacing={4}>
                        <FormControl flex={1}>
                            <FormLabel fontSize="sm">{t("inboundBuilder.method") || "Encryption Method"}</FormLabel>
                            <Select
                                size="sm"
                                bg={inputBgColor}
                                value={inbound.settings.method || "chacha20-ietf-poly1305"}
                                onChange={(e) => updateField("settings.method", e.target.value)}
                            >
                                {SS_METHODS.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl flex={1}>
                            <FormLabel fontSize="sm">{t("inboundBuilder.password") || "Password"}</FormLabel>
                            <Input
                                size="sm"
                                bg={inputBgColor}
                                value={inbound.settings.password || ""}
                                onChange={(e) => updateField("settings.password", e.target.value)}
                                placeholder="Password"
                            />
                        </FormControl>
                    </HStack>
                )}

                {/* Sniffing */}
                <HStack>
                    <FormControl display="flex" alignItems="center">
                        <FormLabel fontSize="sm" mb="0">
                            {t("inboundBuilder.sniffing") || "Enable Sniffing"}
                        </FormLabel>
                        <Switch
                            isChecked={inbound.sniffing?.enabled || false}
                            onChange={(e) => updateField("sniffing.enabled", e.target.checked)}
                        />
                    </FormControl>
                </HStack>

                <Divider />

                {/* Actions */}
                <HStack justify="flex-end">
                    <Button size="sm" variant="ghost" onClick={handleReset}>
                        {t("reset") || "Reset"}
                    </Button>
                    <Button
                        size="sm"
                        colorScheme="primary"
                        leftIcon={<AddIcon />}
                        onClick={handleSubmit}
                    >
                        {t("inboundBuilder.addInbound") || "Add Inbound"}
                    </Button>
                </HStack>
            </VStack>
        </Box>
    );
};

export default InboundBuilder;
