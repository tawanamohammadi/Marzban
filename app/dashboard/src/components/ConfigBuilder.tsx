import {
    Box,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    VStack,
    Text,
    useColorModeValue,
    useToast,
    Alert,
    AlertIcon,
    AlertDescription,
    Divider,
} from "@chakra-ui/react";
import { FC, useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { InboundBuilder, InboundCard, InboundConfig } from "./InboundBuilder";
import { JsonEditor } from "./JsonEditor";

interface ConfigBuilderProps {
    config: any;
    onChange: (config: any) => void;
}

export const ConfigBuilder: FC<ConfigBuilderProps> = ({ config, onChange }) => {
    const { t } = useTranslation();
    const toast = useToast();
    const bgColor = useColorModeValue("gray.50", "gray.800");
    const [activeTab, setActiveTab] = useState(0);
    const [parsedConfig, setParsedConfig] = useState<any>(null);

    // Parse config when it changes
    useEffect(() => {
        try {
            if (typeof config === "string") {
                setParsedConfig(JSON.parse(config));
            } else {
                setParsedConfig(config);
            }
        } catch (e) {
            console.error("Failed to parse config:", e);
        }
    }, [config]);

    // Get existing inbound tags
    const existingTags = useMemo(() => {
        if (!parsedConfig?.inbounds) return [];
        return parsedConfig.inbounds
            .filter((i: any) => i.tag)
            .map((i: any) => i.tag);
    }, [parsedConfig]);

    // Get user-configurable inbounds (excluding API inbound)
    const userInbounds = useMemo(() => {
        if (!parsedConfig?.inbounds) return [];
        return parsedConfig.inbounds.filter(
            (i: any) =>
                i.tag !== "API_INBOUND" &&
                ["vmess", "vless", "trojan", "shadowsocks"].includes(i.protocol)
        );
    }, [parsedConfig]);

    // Handle adding new inbound from visual builder
    const handleAddInbound = (newInbound: InboundConfig) => {
        if (!parsedConfig) return;

        const updatedConfig = {
            ...parsedConfig,
            inbounds: [...(parsedConfig.inbounds || []), newInbound],
        };

        onChange(updatedConfig);
        setParsedConfig(updatedConfig);

        toast({
            title: t("inboundBuilder.addedSuccess") || "Inbound added successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top",
        });
    };

    // Handle deleting inbound
    const handleDeleteInbound = (tag: string) => {
        if (!parsedConfig) return;

        const updatedConfig = {
            ...parsedConfig,
            inbounds: parsedConfig.inbounds.filter((i: any) => i.tag !== tag),
        };

        onChange(updatedConfig);
        setParsedConfig(updatedConfig);

        toast({
            title: t("delete") + ": " + tag,
            status: "info",
            duration: 3000,
            isClosable: true,
            position: "top",
        });
    };

    // Handle edit inbound
    const handleEditInbound = (inbound: InboundConfig) => {
        // For now, this just shows the JSON in the raw editor
        // Could be enhanced to open the builder with pre-filled values
        setActiveTab(0);
    };

    // Handle JSON editor change
    const handleJsonChange = (value: any) => {
        onChange(value);
        try {
            if (typeof value === "string") {
                setParsedConfig(JSON.parse(value));
            } else {
                setParsedConfig(value);
            }
        } catch (e) {
            // JSON might be invalid during editing
        }
    };

    return (
        <Tabs
            variant="enclosed"
            colorScheme="primary"
            index={activeTab}
            onChange={setActiveTab}
        >
            <TabList>
                <Tab fontSize="sm">{t("core.configuration") || "JSON Editor"}</Tab>
                <Tab fontSize="sm">{t("inboundBuilder.title") || "Visual Builder"}</Tab>
            </TabList>

            <TabPanels>
                {/* JSON Editor Tab */}
                <TabPanel p={0} pt={3}>
                    <JsonEditor json={config} onChange={handleJsonChange} />
                </TabPanel>

                {/* Visual Builder Tab */}
                <TabPanel p={0} pt={3}>
                    <VStack spacing={4} align="stretch">
                        {/* Existing Inbounds */}
                        {userInbounds.length > 0 && (
                            <Box>
                                <Text fontWeight="semibold" mb={2}>
                                    {t("inbound") || "Inbounds"} ({userInbounds.length})
                                </Text>
                                <VStack spacing={2}>
                                    {userInbounds.map((inbound: any) => (
                                        <InboundCard
                                            key={inbound.tag}
                                            inbound={inbound}
                                            onDelete={() => handleDeleteInbound(inbound.tag)}
                                            onEdit={handleEditInbound}
                                        />
                                    ))}
                                </VStack>
                            </Box>
                        )}

                        {userInbounds.length === 0 && (
                            <Alert status="info" borderRadius="md">
                                <AlertIcon />
                                <AlertDescription fontSize="sm">
                                    {t("inboundBuilder.noInbounds") ||
                                        "No inbounds configured yet. Add one using the form below."}
                                </AlertDescription>
                            </Alert>
                        )}

                        <Divider />

                        {/* Add New Inbound */}
                        <InboundBuilder onAdd={handleAddInbound} existingTags={existingTags} />
                    </VStack>
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
};

export default ConfigBuilder;
