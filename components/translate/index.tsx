import React from 'react';
import InputArea from '@/components/inputArea';
import { Button } from '@/components/ui/button';
import { Copy, Loader } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import chatHandler from '@/lib/chat';
import { addHistory } from '@/lib/history';
import useApi from '@/lib/useApi';

const languageList = [
    'English', '简体中文', '繁體中文', '日本語', '한국어', 'Français', 'Deutsch',
    'Italiano', 'Español', 'Português', 'Polski', 'Русский', 'العربية', 'Türkçe'
];

const Translate = (): JSX.Element => {
    const [content, setContent] = React.useState('');
    const [defaultLanguage, setDefaultLanguage] = React.useState('简体中文');
    const [result, setResult] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const api = useApi();
    const { toast } = useToast();

    const translate = async (): Promise<void> => {
        setIsLoading(true);
        setResult('');

        if (api.key === '') {
            toast({
                title: 'API key is empty',
                description: 'Please enter your API key in the settings',
                status: 'error',
                duration: 5000,
                variant: 'destructive'
            });
            setIsLoading(false);
            return;
        }

        await chatHandler(
            {
                api: api.api,
                key: api.key,
                message: `Please translate this message to ${defaultLanguage}:\n${content}`
            },
            (streamedContent: string) => {
                setResult(prevResult => prevResult + streamedContent);
            }
        ).finally(() => {
            setIsLoading(false);
            addHistory({
                originLanguageContent: content,
                translatedLanguageContent: result
            });
        });
    };


    return (
        <div className={'w-full flex flex-col'}>
            <div className={'flex flex-col lg:grid lg:grid-cols-2 w-full border-2 border-gray-100 overflow-hidden font-sans'}>
                <div className={'w-full h-96 h-full bg-gray-50 overflow-hidden'}>
                    {/* 输入区域 */}
                    <InputArea onContentChange={(content) => { setContent(content); }}/>
                </div>
                <div className={'w-full min-h-[200px] h-full border-l-2 border-gray-100 p-2 overflow-auto'}>
                    {result}
                </div>
            </div>
            <div className={'flex lg:grid lg:grid-cols-2 h-14 w-full bg-gray-50 border-l-2 border-b-2 border-r-2 border-gray-100 overflow-hidden font-sans'}>
                <div className={'w-full h-full flex items-center justify-end px-3'}>
                    <Select onValueChange={(value) => { setDefaultLanguage(value); }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Translate to"/>
                        </SelectTrigger>
                        <SelectContent>
                            {languageList.map((item, index) => (
                                <SelectItem key={index} value={item}>
                                    {item}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        disabled={isLoading}
                        variant="outline"
                        className={'font-bold ml-2'}
                        onClick={() => { void translate(); }}
                    >
                        <Loader className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : 'hidden'}`}/>
                        Translate
                    </Button>
                </div>
                <div className={'border-t-2 lg:border-t-0 lg:border-l-2 border-gray-100 w-full h-full flex items-center justify-end px-3'}>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            void navigator.clipboard.writeText(result).then(() => {
                                toast({
                                    description: 'Copy success'
                                });
                            }).catch(() => {
                                toast({
                                    variant: 'destructive',
                                    description: 'Copy failed'
                                });
                            });
                        }}
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Translate;
